# Plan: Raw Commit Rows Endpoint

## Context

`GET /api/repo/:owner/:repo` (`src/backend/routes/repo.ts`) queries the last 100 commits on `main` from the GitHub GraphQL API, then passes the edges to `parseRepoEdges` (`src/backend/lib/github/parser.ts`). That function turns them into three 20-bucket histograms (`additions`, `deletions`, `changedFiles`) and returns them as `[RepoCommitData]`. Bucketing on the server throws away exact values, dates and authors, and the query asks for `pushedDate`, which GitHub has deprecated and which is usually null. This plan changes the endpoint to return trimmed raw rows as `{ commits: CommitRow[], hasNextPage: boolean }`. It also moves the edge-to-row mapping into a small pure module, makes the commit types honest about nullable authors and dates, and deletes the server-side parser. Source: `docs/features/005-raw-commit-rows-endpoint/requirements.md`.

---

## Options Considered

### Option A: Route handler test calling `get` directly, with MSW intercepting GitHub
Unit-test the mapping module. Integration-test the route by calling the exported `get(req, res, next)` handler with a minimal fake `req` (`params`, `session`) and a spy `res`. MSW (`msw/node`) intercepts the real `@octokit/graphql` request to `https://api.github.com/graphql`.

**Pros**: Needs no new dependencies (`msw` is already a devDependency, and there is no `supertest`). It runs the real GraphQL client, the real response destructuring and the real error path. It also matches the fake-req/res style already used in `src/backend/middleware/__tests__/errorHandler.test.ts`.
**Cons**: Skips Express routing and the session middleware. That is acceptable, because the route registration in `server.ts` does not change.

### Option B: Full HTTP test against `app` from `server.ts` using `supertest`
Import `app`, add `supertest`, and drive real HTTP requests.

**Pros**: Covers the whole stack, including the route path.
**Cons**: Adds a dependency. Importing `server.ts` throws unless `SESSION_SECRET` is set. Getting an authenticated session needs a real cookie, and the session cookie is `secure: true`, so it is not sent over plain-HTTP supertest without proxy tricks. That is a lot of setup to test a handler whose wiring is not changing.

**Chosen**: Option A. It meets the MSW integration-testing requirement with no new dependencies or session workarounds, and it still exercises the real GraphQL client.

---

## Files to Create

| File | Purpose |
|---|---|
| `src/backend/lib/github/commits.ts` | Pure mapping functions. `toCommitRow(edge)` maps one GraphQL edge to a `CommitRow`. `toRepoCommitsResponse(history)` maps a nullable `CommitHistory` to `{ commits, hasNextPage }`. No Express or network imports, so it can be tested on its own. |
| `src/backend/lib/github/__tests__/commits.test.ts` | Unit tests for the mapping: a normal commit, null `author.user`, null `author`, null `committedDate`, an empty edge list, a null history, order preservation, and no extra fields leaking through. |
| `src/backend/routes/__tests__/repo.test.ts` | Integration tests for the `get` handler. MSW mocks the GitHub GraphQL endpoint. Covers the success shape, 401 without a token, empty history (both `edges: []` and `ref: null`), and GraphQL errors being passed to `next`. |

---

## Files to Modify

| File | Change |
|---|---|
| `src/backend/types/commit.ts` | Make `CommitAuthor.user` `{ login: string } \| null`. Make `CommitNode.author` `CommitAuthor \| null`. Replace `pushedDate` with `committedDate: string \| null`. Export `CommitHistory`. Make `ref` nullable in `GitHubRepositoryResponse`, because a repository with no `main` branch or no commits returns `ref: null`. Add and export `CommitRow` and `RepoCommitsResponse` so the frontend (feature 006) can copy them. |
| `src/backend/routes/repo.ts` | Request `committedDate` instead of `pushedDate` in the query. Remove the `parseRepoEdges` import and call. Destructure `history` safely, using optional chaining for a null `ref`. Respond with `toRepoCommitsResponse(history)`. Auth, timeout and `next(error)` handling stay exactly as they are. |

---

## Files to Delete

| File | Reason |
|---|---|
| `src/backend/lib/github/parser.ts` | Server-side bucketing is gone (Requirement 4). `SeriesItem`, `RepoCommitData`, `DataItem` and `RangeBoundaries` are private to this file, so deleting it removes those types too. |
| `src/backend/lib/github/__tests__/parser.test.ts` | Tests for the deleted parser. |

---

## Implementation

### 1. Confirm `pushedDate` deprecation (Requirement 2.1)

Before changing the query, check the GitHub GraphQL schema reference for the `Commit` object (https://docs.github.com/en/graphql/reference/objects#commit). `Commit.pushedDate` is marked deprecated ("`pushedDate` is no longer supported") and returns null for most commits. `committedDate` is a non-null `DateTime` (ISO 8601). Mention this in the PR description. Type `committedDate` as nullable anyway: the requirements ask for it, and it keeps the mapper defensive.

### 2. `src/backend/types/commit.ts` — nullable types and the response contract

Replace the whole file with:

```ts
interface CommitAuthor {
  user: {
    login: string;
  } | null;
}

export interface CommitNode {
  additions: number;
  deletions: number;
  changedFiles: number;
  committedDate: string | null;
  oid: string;
  author: CommitAuthor | null;
}

export interface CommitEdge {
  node: CommitNode;
}

export interface CommitHistory {
  pageInfo: {
    hasNextPage: boolean;
  };
  edges: CommitEdge[];
}

export interface GitHubRepositoryResponse {
  repository: {
    ref: {
      target: {
        id: string;
        history: CommitHistory;
      };
    } | null;
  };
}

export interface CommitRow {
  oid: string;
  date: string | null;
  additions: number;
  deletions: number;
  changedFiles: number;
  author: string | null;
}

export interface RepoCommitsResponse {
  commits: CommitRow[];
  hasNextPage: boolean;
}
```

### 3. `src/backend/lib/github/commits.ts` — pure mapping

```ts
import { CommitEdge, CommitHistory, CommitRow, RepoCommitsResponse } from '../../types/commit.js'

export function toCommitRow({ node }: CommitEdge): CommitRow {
  return {
    oid: node.oid,
    date: node.committedDate ?? null,
    additions: node.additions,
    deletions: node.deletions,
    changedFiles: node.changedFiles,
    author: node.author?.user?.login ?? null,
  }
}

export function toRepoCommitsResponse(history: CommitHistory | null | undefined): RepoCommitsResponse {
  if (!history) {
    return { commits: [], hasNextPage: false }
  }

  return {
    commits: history.edges.map(toCommitRow),
    hasNextPage: history.pageInfo.hasNextPage,
  }
}
```

- The function builds an explicit object literal instead of spreading `node`, so only the six listed fields go out. Author email, `id` and any other field added to the query later cannot leak (Security NFR).
- `Array.prototype.map` keeps GitHub's newest-first order in a single O(n) pass.

### 4. `src/backend/routes/repo.ts` — new query field and response

Query change, inside `node { ... }`:

```diff
                   changedFiles
-                  pushedDate
+                  committedDate
                   oid
```

Imports:

```diff
-import { parseRepoEdges } from '../lib/github/parser.js'
+import { toRepoCommitsResponse } from '../lib/github/commits.js'
 import { OK, UNAUTHORIZED } from '../lib/status.js'
 import { GitHubRepositoryResponse } from '../types/commit.js'
```

Body of the `try` block:

```ts
// before
const { repository: { ref: { target: { history: { edges } } } } } = await graphqlWithAuth(query, { owner, repo }) as GitHubRepositoryResponse
const repoSeries = parseRepoEdges(edges, ['additions', 'deletions', 'changedFiles'])
res.status(OK).json(repoSeries)

// after
const { repository } = await graphqlWithAuth(query, { owner, repo }) as GitHubRepositoryResponse
const history = repository.ref?.target.history

res.status(OK).json(toRepoCommitsResponse(history))
```

Leave the auth check, the `graphql.defaults` setup with `AbortSignal.timeout`, and `catch (error) { next(error) }` unchanged. An unknown repository still makes `@octokit/graphql` throw a `GraphqlResponseError`, which goes to `next`.

### 5. Delete the parser

Delete `src/backend/lib/github/parser.ts` and `src/backend/lib/github/__tests__/parser.test.ts`. A grep shows nothing else references `parseRepoEdges`, `SeriesItem` or `RepoCommitData`. `logger` is still used elsewhere, so no other cleanup is needed. Run `yarn build` to confirm nothing dangling remains (Requirement 4.3).

### 6. Frontend impact (out of scope, note only)

`src/frontend/stores/repoStore.ts` and `RepoCommits.tsx` still expect the bucketed shape. After this change the live charts will not render correct data until `docs/features/006-frontend-commit-data-binning` lands. Frontend unit tests mock `/api/repo/` with their own fixtures, so the test suite keeps passing. Ship 005 and 006 together, or merge 006 right after.

---

## Key Technical Decisions

- **Handle a null `ref` as empty history**: GitHub returns `ref: null` when the repository has no `main` branch, which includes a freshly created repo with no commits. The current destructuring would throw a `TypeError` there and cause a 500. Returning `{ commits: [], hasNextPage: false }` meets Requirement 1.4 and the Reliability NFR.
- **Explicit field projection instead of spreading**: keeps the API contract fixed and prevents leaks if the query grows.
- **`toRepoCommitsResponse` takes the history, not the whole GraphQL response**: the route keeps responsibility for the network call and response navigation, and the mapper only deals with the data. This keeps the mapper's tests free of the deep GraphQL wrapper.
- **`??` on `committedDate`**: the schema says the field is non-null, but `?? null` turns a missing or `undefined` value into the contract's `null`, so the JSON never drops the key.

---

## Tests to Add

Follow the existing conventions: Vitest, `describe` named after the function under test, and `it` names in `MethodName_Condition_ExpectedOutcome` form, as in the deleted `parser.test.ts`. Use a `makeEdge(overrides)` helper that builds a full `CommitEdge`.

### `src/backend/lib/github/__tests__/commits.test.ts`

#### Test 1: `toCommitRow_FullCommit_ReturnsAllSixFields`
- **Setup**: An edge with `oid: 'abc'`, `committedDate: '2026-01-02T03:04:05Z'`, `additions: 10`, `deletions: 4`, `changedFiles: 2`, `author: { user: { login: 'octocat' } }`.
- **Assert**: `toEqual({ oid: 'abc', date: '2026-01-02T03:04:05Z', additions: 10, deletions: 4, changedFiles: 2, author: 'octocat' })`.

#### Test 2: `toCommitRow_NullAuthorUser_ReturnsNullAuthor`
- **Setup**: An edge with `author: { user: null }`.
- **Assert**: Does not throw, and `row.author` is `null`.

#### Test 3: `toCommitRow_NullAuthor_ReturnsNullAuthor`
- **Setup**: An edge with `author: null`.
- **Assert**: `row.author` is `null`.

#### Test 4: `toCommitRow_NullCommittedDate_ReturnsNullDate`
- **Setup**: An edge with `committedDate: null`.
- **Assert**: `row.date` is `null`, and `'date' in row` is true.

#### Test 5: `toCommitRow_ExtraNodeFields_AreNotForwarded`
- **Setup**: An edge cast as `unknown as CommitEdge` whose node also has `email: 'x@y.z'` and `id: 'node-id'`.
- **Assert**: `Object.keys(row).sort()` equals `['additions', 'author', 'changedFiles', 'date', 'deletions', 'oid']`.

#### Test 6: `toRepoCommitsResponse_MultipleEdges_PreservesInputOrder`
- **Setup**: A history with edges whose oids are `['c3', 'c2', 'c1']` and `hasNextPage: true`.
- **Assert**: `commits.map(c => c.oid)` equals `['c3', 'c2', 'c1']` and `hasNextPage` is `true`.

#### Test 7: `toRepoCommitsResponse_EmptyEdges_ReturnsEmptyCommits`
- **Setup**: `{ pageInfo: { hasNextPage: false }, edges: [] }`.
- **Assert**: `toEqual({ commits: [], hasNextPage: false })`.

#### Test 8: `toRepoCommitsResponse_NullHistory_ReturnsEmptyCommits`
- **Setup**: Pass `undefined`.
- **Assert**: `toEqual({ commits: [], hasNextPage: false })`.

### `src/backend/routes/__tests__/repo.test.ts`

Setup: `setupServer()` from `msw/node`, with `beforeAll(listen({ onUnhandledRequest: 'error' }))`, `afterEach(resetHandlers)` and `afterAll(close)`, following `src/frontend/features/repo/__tests__/RepoCommits.test.tsx`. Each test registers `http.post('https://api.github.com/graphql', ...)` with `server.use(...)`. Build `req` as `{ params: { owner: 'o', repo: 'r' }, session: { accessToken: 'token' } } as unknown as Request` and `res` as `{ status: vi.fn().mockReturnThis(), json: vi.fn() } as unknown as Response`. Set `next = vi.fn()`.

#### Test 1: `get_GraphqlReturnsCommits_RespondsWithCommitsAndHasNextPage`
- **Setup**: The MSW handler returns `{ data: { repository: { ref: { target: { id: '1', history: { pageInfo: { hasNextPage: true }, edges: [two edges, one with author.user null] } } } } } }`. It also captures the request body and the `authorization` header.
- **Assert**: `res.status` was called with `OK` (200). `res.json` was called with `{ commits: [two rows in order, second with author: null], hasNextPage: true }`. The captured query contains `committedDate` and not `pushedDate`. The authorization header is `Bearer token`. `next` was not called.

#### Test 2: `get_NoAccessToken_Responds401AndSkipsGraphql`
- **Setup**: `req.session = {}`. Register a handler that flips a `called` flag.
- **Assert**: `res.status` was called with `UNAUTHORIZED`, `res.json` with `{ error: 'Unauthorized' }`, and `called` is `false`.

#### Test 3: `get_EmptyHistoryEdges_Responds200WithEmptyCommits`
- **Setup**: The handler returns history with `edges: []` and `hasNextPage: false`.
- **Assert**: Status 200, and `res.json` was called with `{ commits: [], hasNextPage: false }`.

#### Test 4: `get_NullRef_Responds200WithEmptyCommits`
- **Setup**: The handler returns `{ data: { repository: { ref: null } } }`.
- **Assert**: Status 200, `res.json` was called with `{ commits: [], hasNextPage: false }`, and `next` was not called.

#### Test 5: `get_GraphqlErrors_PassesErrorToNext`
- **Setup**: The handler returns `{ data: { repository: null }, errors: [{ type: 'NOT_FOUND', message: 'Could not resolve to a Repository' }] }`.
- **Assert**: `next` was called once with an `Error`, and `res.json` was not called.

---

## Verification

```bash
# 1. Build passes (also confirms no remaining references to removed symbols)
yarn build

# 2. Relevant test files pass
yarn test src/backend/lib/github/__tests__/commits.test.ts src/backend/routes/__tests__/repo.test.ts

# 3. Full suite
yarn test

# 4. Lint
yarn lint
```

Manual check (optional): run `yarn dev`, sign in, and open `https://localhost:3000/api/repo/<owner>/<repo>` in the browser. The JSON should be `{ "commits": [...], "hasNextPage": ... }`, with ISO `date` values and no fields beyond the six listed.
