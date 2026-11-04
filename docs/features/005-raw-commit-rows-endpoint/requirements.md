# Requirements Document

## Introduction

`GET /api/repo/:owner/:repo` (`src/backend/routes/repo.ts`) fetches the last 100 commits on `main` from the GitHub GraphQL API and reduces them to three 20-bucket histograms through `parseRepoEdges` in `src/backend/lib/github/parser.ts`. Bucketing on the server discards exact values, dates and authors, so the frontend cannot compute exact totals, percentiles, time series or per-author views. This feature changes the endpoint to return trimmed raw commit rows and removes server-side range parsing. All grouping and binning moves to the frontend. The payload stays small (about 100 rows), so there is no performance reason to bucket on the server.

## Requirements

### Requirement 1

**User Story:** As a frontend developer, I want the repo endpoint to return one row per commit with its raw values, so that I can compute any aggregation in the browser.

#### Acceptance Criteria

1. WHEN the endpoint responds successfully THEN the system SHALL return a JSON array with one object per commit, each containing exactly `oid` (string), `date` (string or null), `additions` (number), `deletions` (number), `changedFiles` (number) and `author` (string or null).
2. WHEN the GraphQL response contains N commit edges THEN the system SHALL return N rows in the same order as GitHub returns them (newest first).
3. WHEN a commit's `author.user` is null (email not linked to a GitHub account) THEN the system SHALL set that row's `author` to null and SHALL NOT throw.
4. IF the repository has no commits on `main` (empty history) THEN the system SHALL return an empty array with status 200.

### Requirement 2

**User Story:** As a frontend developer, I want each row to carry a reliable commit date, so that time-based charts do not depend on a field that may be null or deprecated.

#### Acceptance Criteria

1. WHEN the GraphQL query is built THEN the system SHALL request `committedDate` for each commit node instead of relying on `pushedDate`, after confirming against the GitHub GraphQL schema that `pushedDate` is deprecated or frequently null.
2. WHEN a commit has a `committedDate` THEN the system SHALL return it as an ISO 8601 string in the row's `date` field.
3. IF a commit has no date value THEN the system SHALL return `date: null` for that row.

### Requirement 3

**User Story:** As a frontend developer, I want to know whether the returned commits are the whole history or only a window, so that charts can state their coverage honestly.

#### Acceptance Criteria

1. WHEN the endpoint responds successfully THEN the system SHALL include whether more commits exist beyond the returned window (`hasNextPage`) in the response.
2. WHEN the response shape is defined THEN the system SHALL wrap the rows as `{ commits: CommitRow[], hasNextPage: boolean }`.

### Requirement 4

**User Story:** As a developer, I want the obsolete server-side bucketing removed, so that the codebase has one source of truth for binning.

#### Acceptance Criteria

1. WHEN this feature is complete THEN the system SHALL no longer import or call `parseRepoEdges` from `src/backend/routes/repo.ts`.
2. WHEN this feature is complete THEN the system SHALL delete `src/backend/lib/github/parser.ts` and its tests, and remove types used only by them (`SeriesItem`, `RepoCommitData`).
3. IF other modules still reference removed symbols THEN the system SHALL fail the TypeScript build, and those references SHALL be removed or updated.

### Requirement 5

**User Story:** As a developer, I want the commit types to reflect what GitHub can actually return, so that null authors do not crash at runtime.

#### Acceptance Criteria

1. WHEN `CommitAuthor` is defined in `src/backend/types/commit.ts` THEN the system SHALL type `author.user` as `{ login: string } | null` and `author` itself as nullable.
2. WHEN `CommitNode` is defined THEN the system SHALL replace `pushedDate` with `committedDate: string | null`.

## Non-Functional Requirements

### Code Architecture and Modularity
- Add a small pure mapping function (GraphQL edge to `CommitRow`) in `src/backend/lib/github/` so it can be tested apart from Express and the network.
- Export the `CommitRow` and response types from `src/backend/types/` for the frontend to mirror.
- Keep authentication, error handling and timeout behavior in `routes/repo.ts` unchanged.

### Performance
- Response contains at most 100 rows of six small fields (under 20 KB). Mapping is O(n) with no extra passes.

### Security
- Expose only the listed fields; do not forward the access token, author email or any other GraphQL fields.
- Existing unauthorized handling (401 when no session access token) must be unchanged.

### Reliability
- A null author, null date or empty history must never cause a 500.
- GraphQL errors and timeouts continue to be passed to `next(error)`.

### Usability
- N/A — backend contract change with no direct UI surface. The frontend adaptation is covered by a separate feature.

### Unit Testing
- Test the mapping function with: a normal commit, null `author.user`, null `committedDate`, and an empty edge list.
- Test that row order matches input order.

### Integration Testing
- Using MSW, test the route returns the `{ commits, hasNextPage }` shape for a mocked GraphQL response, returns 401 without a session token, and returns 200 with an empty `commits` array for an empty history.

### E2E Testing
- N/A — no E2E framework is configured; the frontend feature that consumes this contract verifies the full flow.
