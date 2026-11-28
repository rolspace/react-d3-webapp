# Plan: Commit Summary Statistics

## Context

After features 005–008, `repoStore` holds the raw `commits: CommitRow[]` (`oid`, `date`, `additions`, `deletions`, `changedFiles`, `author`) and `hasNextPage`. `RepoCommits` passes `RepoGraphProps` (`commits`, `hasNextPage`, `status`) to whichever graph component a route gives it through `GraphPage(RepoCommits, Component)`. Every view so far is a chart, so none shows exact totals or typical commit sizes, and none links to individual commits.

This plan implements `docs/features/009-commit-summary-stats/requirements.md`. It adds a route, `/graphs/repo-summary`, that shows a statistics panel: commit count, total additions, total deletions and net lines; the median and 90th percentile of additions, deletions and changed files; and the 10 largest commits, each linked to its GitHub page. The panel states that it covers the latest N commits and notes when older commits are excluded. All calculations are pure functions in `src/frontend/utils/summaryStats.ts`. The panel is built from Material-UI components. The home page's `section-3` placeholder card becomes a link to the new page.

`ARCHITECTURE.md` does not exist in this repository. The plan was checked against the architecture section of `AGENTS.md`: a frontend-only feature under the existing graph-page pattern, with Zustand, Material-UI and pure utilities. It needs no backend change.

---

## Options Considered

### Where the panel lives

#### Option A: A new graph route, `/graphs/repo-summary`

Add `CommitSummaryStats` as a graph component and register `GraphPage(RepoCommits, CommitSummaryStats)` the same way feature 008 added `CommitsPerWeek`. The home page's `section-3` placeholder card links to it.

**Pros**: It uses the existing route, fetch, error and loading pattern without changes. It is easy to find from the home page. Each graph page keeps one view.
**Cons**: Users must go to a separate page to see the numbers next to a chart.

#### Option B: Render the panel under every chart inside `GraphPage`

`GraphPage` would render the panel after the chart on every graph route.

**Pros**: The numbers are always visible.
**Cons**: `GraphPage` would need to read the store or receive the data, which breaks the pattern where `RepoCommits` alone feeds the view. Every chart test and page would render the panel, and the routes stop being single-purpose.

**Chosen**: Option A. It matches feature 008's pattern exactly, keeps `GraphPage` and `RepoCommits` unchanged, and keeps the panel self-contained and testable.

### How the panel gets the owner and repository for commit links

#### Option 1: Read `owner` and `repository` from `useRepoStore` inside the panel

**Pros**: No change to `RepoGraphProps`, `RepoCommits` or any other graph component or test. `setRepo` replaces `owner`, `repository` and `commits` in one `set` call, so the loaded commits always belong to the owner and repository in the store.
**Cons**: The panel depends on the store, so component tests must set store state (`resetStores()` already does).

#### Option 2: Add `owner` and `repository` to `RepoGraphProps` and pass them from `RepoCommits`

**Pros**: The panel stays prop-driven.
**Cons**: Every graph component and every test that renders one directly would have to supply two props that only this panel uses.

**Chosen**: Option 1. It is the smaller change. `RepoCommits` already reads the same store fields.

---

## Files to Create

| File | Purpose |
|---|---|
| `src/frontend/utils/summaryStats.ts` | Pure functions with no DOM and no React: `computeTotals`, `computeQuantiles`, `topCommitsBySize`, `shortOid`, `buildCommitUrl` and `computeCommitSummary`, plus their types. Uses `d3.quantile`. |
| `src/frontend/utils/__tests__/summaryStats.test.ts` | Unit tests for every function, including the cases the testing NFR lists and the 10 ms performance budget. |
| `src/frontend/components/CommitSummaryStats.tsx` | The route's graph component (`RepoGraphProps`). It renders the coverage label and note, the totals tiles, the quantile table and the largest-commits table. |
| `src/frontend/components/__tests__/CommitSummaryStats.test.tsx` | Component tests, plus an integration test through `RepoCommits` with MSW. |

---

## Files to Modify

| File | Change |
|---|---|
| `src/frontend/utils/ecdf.ts` | Export the existing `isFiniteNumber` guard so `summaryStats.ts` reuses it instead of copying it. No behavior change. |
| `src/frontend/components/AppRouter.tsx` | Add `CommitSummary = GraphPage(RepoCommits, CommitSummaryStats)` and a `/graphs/repo-summary` route wrapped in `RequireAuth`, as for the other graph routes. |
| `src/frontend/pages/homeCards.ts` | Replace `{ id: 'section-3', title: 'Section 3' }` with `{ id: 'summary-stats', title: 'Summary Stats', to: '/graphs/repo-summary' }`. |
| `src/frontend/pages/__tests__/HomePage.test.tsx` | Add a test that the Summary Stats card title links to `/graphs/repo-summary`. The existing four-card test reads titles from `homeCards`, so it needs no change. |
| `src/frontend/components/__tests__/AppRouter.test.tsx` | Add a test that `/graphs/repo-summary` renders the panel when the user is authenticated. |

---

## Implementation

### 1. `utils/ecdf.ts`: export the numeric guard

```ts
// before
const isFiniteNumber = (v: unknown): v is number =>
  typeof v === 'number' && Number.isFinite(v)

// after
export const isFiniteNumber = (v: unknown): v is number =>
  typeof v === 'number' && Number.isFinite(v)
```

### 2. `utils/summaryStats.ts`: pure statistics

```ts
import { quantile } from 'd3'
import { CommitRow } from '../types/commit.types'
import { isFiniteNumber } from './ecdf'

export const TOP_COMMITS_LIMIT = 10
export const SHORT_OID_LENGTH = 7
export const UNKNOWN_AUTHOR = 'Unknown'

export type SizeMetric = 'additions' | 'deletions' | 'changedFiles'
export const SIZE_METRICS: SizeMetric[] = ['additions', 'deletions', 'changedFiles']

export interface CommitTotals {
  commitCount: number
  additions: number
  deletions: number
  /** additions - deletions. Can be negative. */
  netLines: number
}

export interface MetricQuantiles {
  /** Null when the metric has no finite numeric values. */
  median: number | null
  p90: number | null
}

export interface RankedCommit {
  oid: string
  shortOid: string
  /** The commit author, or UNKNOWN_AUTHOR when it is null or blank. */
  author: string
  /** Null when the value is missing or not a finite number. */
  additions: number | null
  deletions: number | null
  changedFiles: number | null
  /** additions + deletions, with missing values counted as 0. The ranking key. */
  size: number
}

export interface CommitSummary {
  totals: CommitTotals
  quantiles: Record<SizeMetric, MetricQuantiles>
  largest: RankedCommit[]
}

const valueOrNull = (v: unknown): number | null => (isFiniteNumber(v) ? v : null)
const valueOrZero = (v: unknown): number => (isFiniteNumber(v) ? v : 0)

/** Sums each metric. Missing or non-finite values count as 0. Never throws. */
export function computeTotals(commits: ReadonlyArray<CommitRow>): CommitTotals {
  let additions = 0
  let deletions = 0
  for (const c of commits) {
    additions += valueOrZero(c.additions)
    deletions += valueOrZero(c.deletions)
  }
  return { commitCount: commits.length, additions, deletions, netLines: additions - deletions }
}

/** Median and 90th percentile with linear interpolation (d3.quantile, R-7). Non-finite values are skipped. */
export function computeQuantiles(values: ReadonlyArray<unknown>): MetricQuantiles {
  const numbers = values.filter(isFiniteNumber)
  if (numbers.length === 0) {
    return { median: null, p90: null }
  }
  return { median: quantile(numbers, 0.5) ?? null, p90: quantile(numbers, 0.9) ?? null }
}

/** The first 7 characters of the oid. Returns '' for a non-string. */
export function shortOid(oid: unknown): string {
  return typeof oid === 'string' ? oid.slice(0, SHORT_OID_LENGTH) : ''
}

/**
 * The largest commits by additions + deletions, descending.
 * Ties keep their order in the response (the index is the explicit tie-breaker).
 */
export function topCommitsBySize(
  commits: ReadonlyArray<CommitRow>,
  limit = TOP_COMMITS_LIMIT,
): RankedCommit[] {
  return commits
    .map((c, index) => ({
      index,
      commit: {
        oid: typeof c.oid === 'string' ? c.oid : '',
        shortOid: shortOid(c.oid),
        author: typeof c.author === 'string' && c.author.trim() !== '' ? c.author : UNKNOWN_AUTHOR,
        additions: valueOrNull(c.additions),
        deletions: valueOrNull(c.deletions),
        changedFiles: valueOrNull(c.changedFiles),
        size: valueOrZero(c.additions) + valueOrZero(c.deletions),
      },
    }))
    .sort((a, b) => b.commit.size - a.commit.size || a.index - b.index)
    .slice(0, limit)
    .map(({ commit }) => commit)
}

// GitHub owner names: letters, digits and single hyphens. Repository names: letters, digits, '.', '_' and '-'.
const OWNER_PATTERN = /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,38})$/
const REPOSITORY_PATTERN = /^[A-Za-z0-9._-]{1,100}$/
const OID_PATTERN = /^[0-9a-f]{7,40}$/i

/**
 * https://github.com/{owner}/{repo}/commit/{oid}, with each segment encoded.
 * Returns null when any segment is not a valid GitHub name or commit hash, so no link is rendered.
 */
export function buildCommitUrl(owner: string, repository: string, oid: string): string | null {
  if (!OWNER_PATTERN.test(owner) || !REPOSITORY_PATTERN.test(repository)
    || repository === '.' || repository === '..' || !OID_PATTERN.test(oid)) {
    return null
  }
  return `https://github.com/${encodeURIComponent(owner)}/${encodeURIComponent(repository)}/commit/${encodeURIComponent(oid)}`
}

export function computeCommitSummary(commits: ReadonlyArray<CommitRow>): CommitSummary {
  const quantiles = Object.fromEntries(
    SIZE_METRICS.map((key) => [key, computeQuantiles(commits.map((c) => c[key]))]),
  ) as Record<SizeMetric, MetricQuantiles>
  return { totals: computeTotals(commits), quantiles, largest: topCommitsBySize(commits) }
}
```

Notes:
- `d3.quantile` returns `undefined` only for an empty input, which is handled first. With one value it returns that value for every `p`, which meets Requirement 2.3.
- `CommitRow` types the metrics as `number`, but the guards protect against `null` or malformed API values (Reliability NFR).
- `Array.prototype.sort` is stable in ES2019 and later. The `a.index - b.index` tie-breaker makes the order explicit anyway.

### 3. `components/CommitSummaryStats.tsx`: the panel

Structure, top to bottom, inside a `Box`:

1. **Loading and empty states**, in the same order as `CommitsPerWeek`: `Status.Pending` returns `<CircularProgress sx={{ display: 'block', mx: 'auto', my: 8 }} />`. `commits.length === 0` returns `<ChartEmptyState />` (Requirement 4.3).
2. **Coverage**: always render `<Typography variant="body2">Totals cover the latest {formatCount(n)} {n === 1 ? 'commit' : 'commits'}.</Typography>` (Requirement 4.1). When `hasNextPage` is true, also render `<Typography variant="body2" color="text.secondary">Older commits are not included.</Typography>` (Requirement 4.2).
3. **Totals**: a heading `<Typography variant="h6" component="h2">Totals</Typography>`, then four tiles in a CSS grid: `gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }`, `gap: 2`. Each tile is `<Paper variant="outlined" sx={{ p: 2 }}>` with a caption label (`Typography variant="body2" color="text.secondary"`) and the value (`Typography variant="h5" component="p"`). The labels are Commits, Additions, Deletions and Net lines. Values use `formatCount`. Net lines uses `formatSigned`, so the direction is shown by the sign and the text color stays `text.primary` (Requirement 1.3).
4. **Commit size**: a heading `Commit size`, then a small MUI `Table` (`size="small"`) with column headers `Metric | Median | 90th percentile` and one row per metric: Additions, Deletions and Changed files. Each value uses `formatStat`, which renders `—` when the value is `null` (Requirement 2.2).
5. **Largest commits**: a heading `Largest commits`, then `<TableContainer sx={{ overflowX: 'auto' }}>` with a `Table size="small"` and an `aria-label` of "Largest commits by lines changed". Its columns are `Commit | Author | Additions | Deletions | Changed files`, with numeric columns `align="right"`. Each row comes from `summary.largest`. The Commit cell holds the link (step 4). Author is rendered as a text node, never as HTML. Numeric cells use `formatStat`.

Formatting helpers at module scope:

```ts
const formatCount = d3.format(',')            // 1234 -> "1,234"; negative uses U+2212 "−"
const formatStatNumber = d3.format(',.1~f')   // 12.5 -> "12.5", 1234 -> "1,234"
const PLACEHOLDER = '—'
const formatStat = (v: number | null) => (v === null ? PLACEHOLDER : formatStatNumber(v))
const formatSigned = (v: number) => (v > 0 ? `+${formatCount(v)}` : formatCount(v)) // 0 -> "0", -5 -> "−5"
```

`d3.format(',')` is already used by `EcdfCommitSize`, so the number style matches. Its minus sign is U+2212, which screen readers announce as "minus". Tests must assert `'−1,234'`, not a hyphen.

Memoization (Performance NFR):

```tsx
const owner = useRepoStore((state) => state.owner)
const repository = useRepoStore((state) => state.repository)
const summary = useMemo(() => computeCommitSummary(commits), [commits])
```

Call these hooks before the early returns for pending and empty states, so the hook order never changes.

### 4. Commit links

In each row of the largest-commits table:

```tsx
const href = buildCommitUrl(owner, repository, commit.oid)
<TableCell component="th" scope="row">
  {href ? (
    <MuiLink
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Commit ${commit.shortOid} on GitHub (opens in a new tab)`}
      sx={{ fontFamily: 'monospace' }}
    >
      {commit.shortOid}
    </MuiLink>
  ) : (
    <Box component="span" sx={{ fontFamily: 'monospace' }}>{commit.shortOid}</Box>
  )}
</TableCell>
```

A link inside the first cell is the "activation" target (Requirement 3.3). Users can reach it with Tab and open it with Enter, and it keeps native link behavior such as middle-click and copy link. Making the whole `<tr>` clickable would need custom key handling and would hide the link from assistive technology. Use row keys of `${commit.oid}-${index}`, because a malformed response could repeat an oid.

### 5. `AppRouter.tsx`: route

```tsx
import CommitSummaryStats from './CommitSummaryStats'
// ...
const CommitSummary = GraphPage(RepoCommits, CommitSummaryStats)
// ...
<Route
  path="/graphs/repo-summary"
  element={
    <RequireAuth>
      <CommitSummary />
    </RequireAuth>
  }
/>
```

### 6. `homeCards.ts`: home card link

```ts
// before
{ id: 'section-3', title: 'Section 3' },
// after
{ id: 'summary-stats', title: 'Summary Stats', to: '/graphs/repo-summary' },
```

`HomePage` and `DashboardCard` already support `to`, so they need no change.

---

## Key Technical Decisions

- **`d3.quantile` (linear interpolation) instead of `ecdfQuantile`**: The requirements ask for `d3.quantile`. `ecdfQuantile` is a type-1 inverse ECDF that returns only observed values, so the ECDF page and this panel can show slightly different p90 values for the same data. That is expected. This panel's numbers are labelled "Median" and "90th percentile" without claiming to match the chart.
- **Missing values count as 0 in totals and ranking but are skipped in quantiles**: For a sum, a missing value adds nothing. For a median, treating it as 0 would bias the result downward, so it is excluded. A metric with no values shows `—`.
- **Validated link segments**: The store's `owner` and `repository` come from free-text form input, and the backend does not validate them. `buildCommitUrl` checks each segment against GitHub's naming rules, checks the oid as hex, and encodes every segment. If any check fails, the oid is shown without a link, so a crafted value can never produce an off-site or path-traversal URL (Security NFR).
- **Author fallback in the utility**: `topCommitsBySize` maps a null or blank author to `"Unknown"`, so the component never branches on null and the rule is unit-testable.
- **Neutral color for net lines**: The sign carries the direction. No red or green is added, so nothing relies on color, and the panel uses only theme tokens (`text.primary`, `text.secondary`).
- **Horizontal scroll inside the table container only**: Five columns may not fit at 360 px. The tiles stack to one column, and the wide table scrolls inside its `TableContainer`, so the page itself never scrolls sideways.

---

## Tests to Add

### `src/frontend/utils/__tests__/summaryStats.test.ts`

Build rows with a local helper, `row(oid, additions, deletions, changedFiles, author = 'a')`, as `EcdfCommitSize.test.tsx` does.

#### Test 1: `computeTotals_Rows_SumsAdditionsDeletionsAndNetLines`
- **Setup**: Rows with additions `[1000, 234, 0]` and deletions `[10, 20, 4]`.
- **Assert**: `{ commitCount: 3, additions: 1234, deletions: 34, netLines: 1200 }`.

#### Test 2: `computeTotals_DeletionsExceedAdditions_ReturnsNegativeNetLines`
- **Setup**: One row with additions 5 and deletions 50.
- **Assert**: `netLines === -45`.

#### Test 3: `computeTotals_MissingNumericValues_CountsThemAsZero`
- **Setup**: Rows whose `additions` or `deletions` are `null as unknown as number` and `NaN`.
- **Assert**: The call does not throw, and the sums include only the finite values.

#### Test 4: `computeTotals_NoCommits_ReturnsZeros`
- **Setup**: `[]`.
- **Assert**: All four fields are 0.

#### Test 5: `computeQuantiles_OddCount_ReturnsMiddleValueAndInterpolatedP90`
- **Setup**: `[5, 1, 4, 2, 3]` (unsorted).
- **Assert**: `median === 3` and `p90` is close to `4.6`.

#### Test 6: `computeQuantiles_EvenCount_InterpolatesMedianAndP90`
- **Setup**: `[10, 20, 30, 40]`.
- **Assert**: `median === 25` and `p90` is close to `37`.

#### Test 7: `computeQuantiles_SingleValue_ReturnsThatValueForBoth`
- **Setup**: `[42]`.
- **Assert**: `{ median: 42, p90: 42 }`.

#### Test 8: `computeQuantiles_Empty_ReturnsNulls`
- **Setup**: `[]`, and separately `[null, undefined, NaN, Infinity, '7']`.
- **Assert**: Both return `{ median: null, p90: null }`.

#### Test 9: `computeQuantiles_MixedValues_IgnoresNonFiniteValues`
- **Setup**: `[null, 4, NaN, 8, 'x']`.
- **Assert**: `median === 6`.

#### Test 10: `topCommitsBySize_MoreThanTenCommits_ReturnsTenLargestDescending`
- **Setup**: 12 rows with sizes 1 to 12, in shuffled order.
- **Assert**: The length is 10, sizes are `[12, 11, …, 3]`, and each `size === additions + deletions`.

#### Test 11: `topCommitsBySize_TiedSizes_KeepsResponseOrder`
- **Setup**: Rows `a (5+5)`, `b (1+0)`, `c (10+0)`, `d (0+10)`.
- **Assert**: The oids are `['a', 'c', 'd', 'b']`. Running it twice gives the same result.

#### Test 12: `topCommitsBySize_FewerThanTenCommits_ReturnsAll`
- **Setup**: 3 rows.
- **Assert**: The length is 3.

#### Test 13: `topCommitsBySize_NullOrBlankAuthor_ReturnsUnknown`
- **Setup**: Rows with `author: null` and `author: '  '`.
- **Assert**: Both have `author === 'Unknown'`. A row with author `'octocat'` keeps it.

#### Test 14: `topCommitsBySize_MissingMetric_ReturnsNullValueAndCountsZeroInSize`
- **Setup**: A row with `deletions: null as unknown as number` and additions 7.
- **Assert**: `deletions === null`, `size === 7`, and the call does not throw.

#### Test 15: `shortOid_FullOid_ReturnsFirstSevenCharacters`
- **Setup**: A 40-character hex oid, the oid `'abc'`, and `null`.
- **Assert**: The results are the first 7 characters, `'abc'` and `''`.

#### Test 16: `buildCommitUrl_ValidSegments_ReturnsGithubCommitUrl`
- **Setup**: `('facebook', 'react', 'a1b2c3d4e5')` and `('my-org', 'repo.js_v2', <40-hex>)`.
- **Assert**: The results equal `https://github.com/facebook/react/commit/a1b2c3d4e5` and the matching second URL.

#### Test 17: `buildCommitUrl_InvalidSegment_ReturnsNull`
- **Setup**: Owners `'a/b'`, `''` and `'evil.com?'`. Repositories `'..'` and `'re po'`. Oid `'not-a-sha'`.
- **Assert**: Each returns `null`.

#### Test 18: `computeCommitSummary_100Commits_ComputesUnder10ms`
- **Setup**: 100 random rows. Call the function once to warm up, then time a second call with `performance.now()`.
- **Assert**: The elapsed time is under 10 ms, `largest` has 10 entries, and all three metrics have non-null quantiles.

### `src/frontend/components/__tests__/CommitSummaryStats.test.tsx`

Call `resetStores()` in `beforeEach`, which sets owner `facebook` and repository `react`, and set `process.env.API_URL = 'http://localhost'`. Render with a `renderPanel(commits, { hasNextPage, status })` helper, as `CommitsPerWeek.test.tsx` does. Use rows with realistic hex oids, for example `'a'.repeat(40)`.

#### Test 19: `CommitSummaryStats_Rows_ShowsFormattedTotalsAndNetLines`
- **Setup**: Rows totalling 1,234 additions and 34 deletions.
- **Assert**: The Commits, Additions, Deletions and Net lines labels are visible, and the text includes `1,234`, `34` and `+1,200`.

#### Test 20: `CommitSummaryStats_NegativeNetLines_ShowsMinusSign`
- **Setup**: Rows with 5 additions and 1,050 deletions.
- **Assert**: The text includes `'−1,045'`.

#### Test 21: `CommitSummaryStats_Rows_ShowsMedianAndP90PerMetric`
- **Setup**: The four-row fixture from Test 6, used as additions.
- **Assert**: The commit-size table has column headers Metric, Median and 90th percentile. The Additions row reads `25` and `37`.

#### Test 22: `CommitSummaryStats_MetricWithoutValues_ShowsDash`
- **Setup**: Every row has `changedFiles: null as unknown as number`.
- **Assert**: The Changed files row in the commit-size table shows `—` in both value cells, and the panel renders without error.

#### Test 23: `CommitSummaryStats_Rows_ListsLargestCommitsInSemanticTable`
- **Setup**: 12 rows with distinct sizes.
- **Assert**: The table named "Largest commits by lines changed" has the column headers Commit, Author, Additions, Deletions and Changed files, plus 10 body rows. The first row is the largest commit, and its oid cell shows 7 characters.

#### Test 24: `CommitSummaryStats_NullAuthor_ShowsUnknown`
- **Setup**: One row with `author: null`.
- **Assert**: `Unknown` appears in the largest-commits table.

#### Test 25: `CommitSummaryStats_CommitLink_OpensGithubCommitInNewTab`
- **Setup**: One row with oid `abcdef1234567890`.
- **Assert**: The link named `Commit abcdef1 on GitHub (opens in a new tab)` has `href` `https://github.com/facebook/react/commit/abcdef1234567890`, `target="_blank"` and `rel="noopener noreferrer"`.

#### Test 26: `CommitSummaryStats_InvalidOwnerInStore_RendersOidWithoutLink`
- **Setup**: `useRepoStore.setState({ owner: 'bad/owner' })` and one row.
- **Assert**: The short oid is visible, and `queryByRole('link')` is null.

#### Test 27: `CommitSummaryStats_CoverageLabel_AlwaysShowsLatestNCommits`
- **Setup**: 3 rows with `hasNextPage: false`.
- **Assert**: `Totals cover the latest 3 commits.` is visible, and `Older commits are not included.` is absent.

#### Test 28: `CommitSummaryStats_HasNextPage_ShowsOlderCommitsNote`
- **Setup**: 3 rows with `hasNextPage: true`.
- **Assert**: `Older commits are not included.` is visible.

#### Test 29: `CommitSummaryStats_NoCommits_ShowsEmptyState`
- **Setup**: `[]` with `Status.Success`.
- **Assert**: `getByRole('status')` has the text `No commits to display for this repository.`, and no table is rendered.

#### Test 30: `CommitSummaryStats_Pending_ShowsSpinner`
- **Setup**: `[]` with `Status.Pending`.
- **Assert**: The `progressbar` is present, and the `status` role is absent.

#### Test 31: `RepoCommits_SummaryRoute_FetchesAndRendersPanel`
- **Setup**: An MSW `http.get(/\/api\/repo\//)` handler returns the rows, including one with a null author, and `hasNextPage: true`. Render `renderWithStores(<RepoCommits graphComponent={CommitSummaryStats} />)`.
- **Assert**: `await findByText(/Totals cover the latest 4 commits/)` succeeds. `Unknown` and `Older commits are not included.` are visible. The first commit link's `href` starts with `https://github.com/facebook/react/commit/`.

### `src/frontend/pages/__tests__/HomePage.test.tsx`

#### Test 32: `HomePage_SummaryStatsCard_LinksToSummaryPage`
- **Setup**: `renderPage()`.
- **Assert**: The link named `Summary Stats` has `href` `/graphs/repo-summary` and sits inside an `h2`.

### `src/frontend/components/__tests__/AppRouter.test.tsx`

#### Test 33: `AppRouter_SummaryPathAuthenticated_RendersSummaryPanel`
- **Setup**: `/api/user/me` returns `{ login: 'octocat' }`, and `/api/repo/` returns two rows. Render at `/graphs/repo-summary`.
- **Assert**: `await findByText(/Totals cover the latest 2 commits/)` succeeds.

---

## Verification

```bash
# 1. Build passes
yarn build

# 2. Relevant test files pass
yarn test src/frontend/utils/__tests__/summaryStats.test.ts src/frontend/components/__tests__/CommitSummaryStats.test.tsx src/frontend/pages/__tests__/HomePage.test.tsx src/frontend/components/__tests__/AppRouter.test.tsx

# 3. Full suite
yarn test

# 4. Lint
yarn lint
```

Manual checks with `yarn dev`, logged in, at `https://localhost:3000/graphs/repo-summary`:
- For `facebook/react`, the totals, quantiles and 10 rows appear, along with "Older commits are not included." because the repository has more than 100 commits.
- Opening a commit link loads the matching GitHub commit page in a new tab.
- In DevTools at 360 px width, the tiles stack to one column, the largest-commits table scrolls inside its container, and the page has no horizontal scroll.
- Submitting a different owner and repository through the form replaces the numbers. Submitting an invalid repository shows the existing error alert.
