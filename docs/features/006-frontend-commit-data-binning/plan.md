# Plan: Frontend Commit Data Binning

## Context

Commit `30f327b` changed `GET/POST /api/repo/:owner/:repo` to return raw rows wrapped as `{ commits: CommitRow[], hasNextPage: boolean }` (see `src/backend/types/commit.ts`). The frontend has not caught up yet. `src/frontend/stores/repoStore.ts` still feeds the response through `createLowRange`/`createHighRange` (`src/frontend/services/range.ts`), which expect an old `{ node }[]` shape and fixed hand-written buckets. It stores the result as `commitData: { changedFiles, linesAdded, linesDeleted }`, which `RepoCommits.tsx` passes to `BarGraphAddsDeletes`/`BarGraphChangedFiles`. This plan implements `docs/features/006-frontend-commit-data-binning/requirements.md`. The store will hold the raw `commits` and `hasNextPage`. A pure `d3.bin()` utility in `src/frontend/utils/binning.ts` will derive histogram bins, with shared thresholds for additions and deletions. The two existing charts will bin the raw rows themselves, memoized, and get a bin-count slider (5–50) and a linear/log toggle. The old range code and bucketed types will be removed.

---

## Options Considered

### Option A: Bin settings as local state in the histogram chart containers

`RepoCommits` passes raw `commits`, `hasNextPage` and `status` to whichever graph component it is given. `BarGraphAddsDeletes` and `BarGraphChangedFiles` each keep `binCount`/`scale` in `useState`. They render a shared `HistogramControls` component and compute bins with `useMemo` over `[commits, binCount, scale]`. Then they pass `DataItem[][]` sets to the D3 renderer `BarGraph`.

**Pros**: The store keeps only fetched data, as the NFR asks ("data fetching in the store, presentation in components"). `RepoCommits` stays generic, so the ECDF, weekly, scatter and beeswarm charts in features 007–011 get the raw rows with no extra work. Changing the bin count never touches the store or the network.
**Cons**: The bin settings reset when the user moves between the two histogram pages. The requirements do not ask for them to persist.

### Option B: Bin settings and derived bins in `repoStore`

Add `binCount`, `scale` and setters to the store. Compute the bins in a store selector, or store them next to `commits`.

**Pros**: The settings persist across navigation.
**Cons**: It mixes view preferences with fetched data. Memoizing derived arrays in Zustand needs extra selector or equality work to avoid re-renders. It also pushes histogram concerns onto every future chart that reads the store.

**Chosen**: Option A. It follows the store/presentation split the requirements set out, keeps `RepoCommits` reusable for the next five charts, and memoizes simply with `useMemo`.

---

## Files to Create

| File | Purpose |
|---|---|
| `src/frontend/types/commit.types.ts` | Frontend copy of the API contract: `CommitRow` (`date` and `author` nullable) and `RepoCommitsResponse`. The frontend and backend use separate tsconfigs, so the frontend cannot import `src/backend/types/commit.ts`. |
| `src/frontend/utils/binning.ts` | Pure binning functions built on `d3.bin()`: `computeBinLayout`, `binValues`, `binSeries`, `binSharedSeries`, plus `DEFAULT_BIN_COUNT`, `MIN_BIN_COUNT`, `MAX_BIN_COUNT`, `LOG_OFFSET` and the `BinScale`/`BinOptions`/`HistogramBin` types. No React or store imports. |
| `src/frontend/utils/__tests__/binning.test.ts` | Unit tests for the binning utility. |
| `src/frontend/components/HistogramControls.tsx` | A labeled MUI `Slider` (bin count 5–50) and a labeled `ToggleButtonGroup` (Linear/Log). Both are keyboard-accessible. The component is controlled through its props. |
| `src/frontend/stores/__tests__/repoStore.test.ts` | Store tests for the `fetchRepo` success, start, failure and network-error paths, and for `setRepo`/`clearRepo` resets with the new shape. |

---

## Files to Modify

| File | Change |
|---|---|
| `src/frontend/stores/repoStore.ts` | Replace `commitData: CommitData` with `commits: CommitRow[]` and `hasNextPage: boolean`. Delete the exported `CommitData` interface and the `range` import. Store `result.commits`/`result.hasNextPage` on success. Reset both on fetch start, failure, `setRepo` and `clearRepo`. Keep the error handling (store the error, then rethrow). |
| `src/frontend/types/graph.types.ts` | Add `RepoGraphProps` (`commits`, `hasNextPage`, `status`), the prop contract for every component that `RepoCommits` renders. |
| `src/frontend/features/repo/RepoCommits.tsx` | Select `commits`/`hasNextPage` in place of `commitData`. Type `graphComponent` as `ComponentType<RepoGraphProps>` and pass `commits`, `hasNextPage` and `status`. Add `.catch` to the `fetchRepo` call in the effect so the rethrown error does not become an unhandled rejection; the store already records it. |
| `src/frontend/components/BarGraphAddsDeletes.tsx` | Take `RepoGraphProps`. Keep `binCount`/`scale` state. Memoize `binSharedSeries([additions, deletions], { binCount, scale })`. Render `HistogramControls` (only when there are commits) above `BarGraph`. Move `graphStyle` to a module constant. |
| `src/frontend/components/BarGraphChangedFiles.tsx` | Same changes, using `binSeries(changedFiles, { binCount, scale })`. |
| `src/frontend/services/bargraph.ts` | Always clear the SVG before drawing. Today it appends a new `<g>` on every call, so re-binning would stack the new bars on top of the old ones. Thin the x-axis tick labels when there are more than 20 bins so the labels stay readable at 50 bins. |
| `src/frontend/services/object.ts` | Remove `cloneDeep`. Its only caller was `range.ts`. `get` stays because `bargraph.ts` uses it. |
| `src/frontend/utils/testUtils.tsx` | In `resetStores`, replace `commitData: {...}` with `commits: [], hasNextPage: false`. |
| `src/frontend/features/repo/__tests__/RepoCommits.test.tsx` | Change the MSW mock to the `{ commits, hasNextPage }` shape. Replace the brittle `nth-child` selectors with rect counts. Add tests for bin-count changes, the scale toggle, loading, error and empty states. |

---

## Files to Delete

| File | Reason |
|---|---|
| `src/frontend/services/range.ts` | Holds `createHighRange`/`createLowRange` and their private `RangeItem`/`CollectionItem` bucketed types. `binning.ts` replaces it (Requirement 3.4). |

---

## Implementation

### 1. `types/commit.types.ts`: API contract

```ts
export interface CommitRow {
  oid: string
  date: string | null
  additions: number
  deletions: number
  changedFiles: number
  author: string | null
}

export interface RepoCommitsResponse {
  commits: CommitRow[]
  hasNextPage: boolean
}
```

### 2. `types/graph.types.ts`: graph component props

Keep `DataItem`, `BarGraphDataSets` and `BarGraphStyle` unchanged, because the D3 renderer still uses them. Add:

```ts
import { CommitRow } from './commit.types'
import { Status } from './state.types'

export interface RepoGraphProps {
  commits: CommitRow[]
  hasNextPage: boolean
  status: Status
}
```

### 3. `stores/repoStore.ts`: hold raw rows

Remove `import { createHighRange, createLowRange } from '../services/range'`, `import { DataItem } ...` and the `CommitData` interface. Add one shared reset object:

```ts
import { CommitRow, RepoCommitsResponse } from '../types/commit.types'

interface RepoProperties {
  commits: CommitRow[]
  hasNextPage: boolean
  status: Status
  error: Error | null
}

const emptyCommits = (): Pick<RepoProperties, 'commits' | 'hasNextPage'> => ({
  commits: [],
  hasNextPage: false,
})
```

Use `...emptyCommits()` in the initial state, `setRepo`, the `Pending` set at the start of `fetchRepo`, the `catch` block and `clearRepo`. It is a function so that each reset gets a new array. The success branch becomes:

```ts
const result: RepoCommitsResponse = await response.json()

if (response.ok) {
  set({
    status: Status.Success,
    commits: Array.isArray(result.commits) ? result.commits : [],
    hasNextPage: result.hasNextPage === true,
  })
} else {
  const { statusText } = response
  throw new Error(statusText)
}
```

The `catch` block stays the same apart from the reset: set `Status.Failure`, store the error, then `throw error`. That covers Requirement 1.3 and the reliability NFR: no stale commits remain after a failed fetch.

### 4. `utils/binning.ts`: d3.bin utility

Design rules:
- The metrics (`additions`, `deletions`, `changedFiles`) are non-negative integers. Bins are half-open integer ranges `[x0, x1)`. Each label shows the integers the bin actually contains: `"x0"` when `x1 - x0 === 1`, otherwise `` `${x0}-${x1 - 1}` ``. This keeps the old hyphen style.
- **Linear**: bin width is `max(1, ceil((max - min + 1) / binCount))`. The bin count is `ceil(span / width)`, which is at most `binCount`. When the range has fewer distinct integers than `binCount` (for example, changed files 1–7 with 20 bins requested), you get one bin per integer instead of empty fractional bins. If all values are equal, width is 1 and there is a single bin (Requirement 2.3).
- **Log**: thresholds are spaced evenly over `[log10(min + LOG_OFFSET), log10(max + LOG_OFFSET)]` with `LOG_OFFSET = 1`. That makes `0` map to `log10(1) = 0`, so zero-line commits are valid (Requirement 2.6). Thresholds are mapped back to raw space with `ceil(10^u - LOG_OFFSET)`, deduplicated, and limited to `(min, max]`. Narrow low ranges can therefore produce fewer bins than requested. Binning happens on the raw values, so labels show real line counts.
- Empty or non-finite input returns `[]` and never throws (Requirement 2.4). `binCount` defaults to 20 (Requirement 2.5) and is clamped to an integer of at least 1. The UI enforces the 5–50 range.

```ts
import { bin, range } from 'd3'
import { DataItem } from '../types/graph.types'

export type BinScale = 'linear' | 'log'

export interface BinOptions {
  binCount?: number
  scale?: BinScale
}

/** A histogram bin over the half-open integer range [x0, x1). */
export interface HistogramBin extends DataItem {
  x0: number
  x1: number
}

export interface BinLayout {
  domain: [number, number]
  thresholds: number[]
}

export const DEFAULT_BIN_COUNT = 20
export const MIN_BIN_COUNT = 5
export const MAX_BIN_COUNT = 50
/** Added before log10 so that zero values map to log10(1) = 0. */
export const LOG_OFFSET = 1

const finite = (values: number[]): number[] => values.filter(Number.isFinite)

const labelFor = (x0: number, x1: number): string =>
  x1 - x0 === 1 ? String(x0) : `${x0}-${x1 - 1}`

export function computeBinLayout(values: number[], options: BinOptions = {}): BinLayout | null {
  const clean = finite(values)
  if (clean.length === 0) {
    return null
  }

  const binCount = Math.max(1, Math.floor(options.binCount ?? DEFAULT_BIN_COUNT))
  const min = Math.min(...clean)
  const max = Math.max(...clean)

  if (options.scale === 'log') {
    const lo = Math.log10(min + LOG_OFFSET)
    const hi = Math.log10(max + LOG_OFFSET)
    const raw = range(1, binCount).map((i) =>
      Math.ceil(10 ** (lo + (i * (hi - lo)) / binCount) - LOG_OFFSET),
    )
    const thresholds = Array.from(new Set(raw)).filter((t) => t > min && t <= max)
    return { domain: [min, max + 1], thresholds }
  }

  const span = max - min + 1
  const width = Math.max(1, Math.ceil(span / binCount))
  const count = Math.ceil(span / width)
  return {
    domain: [min, min + count * width],
    thresholds: range(1, count).map((i) => min + i * width),
  }
}

export function binValues(values: number[], layout: BinLayout): HistogramBin[] {
  const clean = finite(values)
  if (clean.length === 0) {
    return []
  }

  return bin<number, number>()
    .domain(layout.domain)
    .thresholds(layout.thresholds)(clean)
    .map((b) => {
      const x0 = b.x0 ?? layout.domain[0]
      const x1 = b.x1 ?? layout.domain[1]
      return { x0, x1, count: b.length, label: labelFor(x0, x1) }
    })
}

/** Bins one series using thresholds computed from that series only. */
export function binSeries(values: number[], options: BinOptions = {}): HistogramBin[] {
  const layout = computeBinLayout(values, options)
  return layout ? binValues(values, layout) : []
}

/**
 * Bins several series over one set of thresholds computed from their combined
 * extent, so that bars line up on a shared axis. An empty series yields [].
 */
export function binSharedSeries(series: number[][], options: BinOptions = {}): HistogramBin[][] {
  const layout = computeBinLayout(series.flat(), options)
  return series.map((values) => (layout ? binValues(values, layout) : []))
}
```

`d3.bin` with an explicit threshold array puts each value in bin `bisectRight(thresholds, v)`. With the domain end set past `max`, every bin is exactly `[x0, x1)`. An empty `thresholds` array gives one bin covering the whole domain, which is the all-equal case.

### 5. `components/HistogramControls.tsx`: bin count and scale controls

```tsx
import FormLabel from '@mui/material/FormLabel'
import Slider from '@mui/material/Slider'
import Stack from '@mui/material/Stack'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import React, { useId } from 'react'
import { BinScale, MAX_BIN_COUNT, MIN_BIN_COUNT } from '../utils/binning'

interface HistogramControlsProps {
  binCount: number
  scale: BinScale
  onBinCountChange: (binCount: number) => void
  onScaleChange: (scale: BinScale) => void
}

const HistogramControls: React.FC<HistogramControlsProps> = ({
  binCount, scale, onBinCountChange, onScaleChange,
}) => {
  const binLabelId = useId()
  const scaleLabelId = useId()

  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={4} sx={{ alignItems: 'center', mb: 2 }}>
      <Stack sx={{ minWidth: 220 }}>
        <FormLabel id={binLabelId}>Bins: {binCount}</FormLabel>
        <Slider
          aria-labelledby={binLabelId}
          min={MIN_BIN_COUNT}
          max={MAX_BIN_COUNT}
          step={1}
          value={binCount}
          valueLabelDisplay="auto"
          onChange={(_, value) => onBinCountChange(value as number)}
        />
      </Stack>
      <Stack>
        <FormLabel id={scaleLabelId}>Scale</FormLabel>
        <ToggleButtonGroup
          aria-labelledby={scaleLabelId}
          exclusive
          size="small"
          value={scale}
          onChange={(_, value: BinScale | null) => value && onScaleChange(value)}
        >
          <ToggleButton value="linear">Linear</ToggleButton>
          <ToggleButton value="log">Log</ToggleButton>
        </ToggleButtonGroup>
      </Stack>
    </Stack>
  )
}

export default HistogramControls
```

The `value && ...` guard stops an exclusive group from being deselected when the user clicks the active button. MUI's `Slider` handles arrow keys, Home/End and PageUp/PageDown. `ToggleButton`s are native buttons. Both have visible labels linked through `aria-labelledby`, which covers the usability NFR.

### 6. `BarGraphAddsDeletes.tsx` / `BarGraphChangedFiles.tsx`: bin in the chart container

```tsx
import React, { useMemo, useState } from 'react'
import { RepoGraphProps } from '../types/graph.types'
import { BinScale, DEFAULT_BIN_COUNT, binSharedSeries } from '../utils/binning'
import BarGraph from './BarGraph'
import HistogramControls from './HistogramControls'

const graphStyle = {
  colors: ['#2da44e', '#cf222e'],
  xAxisLabel: 'Code Lines',
  yAxisLabel: 'Total Commits',
}

const BarGraphAddsDeletes: React.FC<RepoGraphProps> = ({ commits, status }) => {
  const [binCount, setBinCount] = useState(DEFAULT_BIN_COUNT)
  const [scale, setScale] = useState<BinScale>('linear')

  const sets = useMemo(
    () => binSharedSeries(
      [commits.map((c) => c.additions), commits.map((c) => c.deletions)],
      { binCount, scale },
    ),
    [commits, binCount, scale],
  )

  return (
    <>
      {commits.length > 0 && (
        <HistogramControls
          binCount={binCount}
          scale={scale}
          onBinCountChange={setBinCount}
          onScaleChange={setScale}
        />
      )}
      <BarGraph graphStyle={graphStyle} sets={sets} status={status} />
    </>
  )
}
```

`BarGraphChangedFiles` follows the same pattern, with `colors: ['#00bcd4']`, `xAxisLabel: 'Changed Files'`, and `useMemo(() => [binSeries(commits.map((c) => c.changedFiles), { binCount, scale })], [commits, binCount, scale])`.

- Moving `graphStyle` to a module constant matters. `BarGraph`'s `useEffect` depends on `[sets, graphStyle]`, and an inline object literal re-runs the D3 render on every parent render.
- The controls render only when `commits.length > 0`. In the Pending, Failure and empty states the page looks exactly as it does today (Requirement 3.3): the `BarGraph` spinner, the `RepoCommits` alert, or an empty SVG.
- Remove the `if (!datasource) return null` guards. `commits` is always an array.

### 7. `features/repo/RepoCommits.tsx`: pass raw rows

```tsx
interface RepoCommitsProps {
  graphComponent: ComponentType<RepoGraphProps>
}
// ...
const commits = useRepoStore((state) => state.commits)
const hasNextPage = useRepoStore((state) => state.hasNextPage)
// ...
useEffect(() => {
  if (token !== '' && status === Status.Idle && error === null) {
    // The store records the failure in `error`, so the rethrown error needs no handling here.
    fetchRepo({ owner, repository, token }).catch(() => undefined)
  }
}, [owner, repository, token, status, error, fetchRepo])
// ...
return <GraphComponent commits={commits} hasNextPage={hasNextPage} status={status} />
```

The error alert branch is unchanged. `AppRouter.tsx` and `GraphPage.tsx` need no changes, because `GraphPage` already accepts `React.FC<any>`.

### 8. `services/bargraph.ts`: clear on redraw and thin dense tick labels

Before:

```ts
export const renderBarGraph = (svgElement, sets, style): void => {
  if (sets.every((set) => !set.length)) {
    d3.select(svgElement).selectAll('*').remove()
  } else {
    // ... append('g') ...
```

After:

```ts
const MAX_X_TICK_LABELS = 20

export const renderBarGraph = (svgElement: SVGSVGElement, sets: BarGraphDataSets, style: BarGraphStyle): void => {
  d3.select(svgElement).selectAll('*').remove()

  if (sets.every((set) => !set.length)) {
    return
  }
  // ... existing body, de-indented one level ...
```

Replace the x-axis call with:

```ts
const xDomain = xScale[0].domain()
const tickStep = Math.ceil(xDomain.length / MAX_X_TICK_LABELS)

innerNode
  .append('g')
  .attr('class', 'axis axis--x')
  .attr('transform', `translate(0, ${graphHeight})`)
  .call(d3.axisBottom(xScale[0]).tickValues(xDomain.filter((_, i) => i % tickStep === 0)))
```

At 20 bins or fewer, `tickStep` is 1 and the axis looks the same as today. The rest of the renderer stays as it is. Shared thresholds give both sets identical labels, so `xScale[0]` and `xScale[1]` line up and the half-width bars sit side by side as they do now (Requirement 3.2).

### 9. Cleanup

- Delete `src/frontend/services/range.ts`.
- Remove `cloneDeep` from `src/frontend/services/object.ts`.
- `grep -rn "commitData\|CommitData\|createHighRange\|createLowRange\|cloneDeep" src/frontend` must return nothing.
- In `src/frontend/utils/testUtils.tsx` `resetStores`, use `commits: [], hasNextPage: false` in place of `commitData`.

---

## Key Technical Decisions

- **Integer-aligned bin widths instead of exactly N equal real-valued bins**: The metrics are integer counts. Equal real-width bins would produce fractional edges and confusing or empty labels (for example, 20 bins over changed files 1–7). Using a width of `ceil(span / N)` gives at most N bins, and each label states exactly which integers it holds. With 20 bins over 0–99, the result is 20 bins of width 5, the same as the old default.
- **Log scale via `log10(v + 1)` threshold spacing, binning raw values**: Placing the thresholds in log space keeps skewed distributions readable. Binning the raw values keeps axis labels in real line counts. The `+1` offset (`LOG_OFFSET`) is the documented way zero values are handled.
- **`binSharedSeries` computes one layout from `series.flat()`**: This is the single source of the shared-thresholds rule (Requirements 2.1 and 3.2). It is generic over N series, so later charts can reuse it.
- **Bin settings are local component state, and bins are memoized with `useMemo`**: Re-binning reads only the stored `commits`, so there is no network request (Requirement 4.2). For 100 rows, `d3.bin` over at most 50 thresholds takes microseconds, well under the 50 ms budget.
- **`HistogramBin extends DataItem`**: The bins can go straight into the existing `BarGraph`/`renderBarGraph` without an adapter. `x0` and `x1` are kept for later charts.
- **`.catch` in `RepoCommits`**: The store has to keep rethrowing (Requirement 1.3). Without the catch, every failed fetch from the component logs an unhandled rejection, and Vitest fails the new error-state test.

---

## Tests to Add

Use the project's convention: the `it()` description is the test name in `MethodName_Condition_ExpectedOutcome` form, grouped under `describe` blocks (see `src/backend/lib/github/__tests__/commits.test.ts`).

### `src/frontend/utils/__tests__/binning.test.ts`

#### Test 1: `binSharedSeries_AdditionsAndDeletions_UsesThresholdsFromCombinedExtent`
- **Setup**: `binSharedSeries([[54, 1, 521], [32, 1, 35]])`.
- **Assert**: Both results have length 20, with identical `x0`/`x1` sequences. The first bin is `{ x0: 1, x1: 28, label: '1-27' }`. The last deletions bin has `x1: 541`, even though the deletions max is 35. Each series' counts sum to 3.

#### Test 2: `binSharedSeries_OneSeriesEmpty_ReturnsEmptyArrayForThatSeries`
- **Setup**: `binSharedSeries([[1, 5, 9], []])`.
- **Assert**: The result is `[nonEmpty, []]`, and it does not throw.

#### Test 3: `binSharedSeries_AllSeriesEmpty_ReturnsEmptyArrays`
- **Setup**: `binSharedSeries([[], []])`.
- **Assert**: The result equals `[[], []]`.

#### Test 4: `binSeries_SingleSeries_UsesOwnExtent`
- **Setup**: `binSeries([3, 1, 7])`.
- **Assert**: There are 7 bins with labels `'1'` through `'7'`. The counts are `[1, 0, 1, 0, 0, 0, 1]`, the first `x0` is 1 and the last `x1` is 8.

#### Test 5: `binSeries_AllValuesEqual_ReturnsSingleBinWithAllValues`
- **Setup**: `binSeries([5, 5, 5])` and `binSeries([5, 5, 5], { scale: 'log' })`.
- **Assert**: Both return `[{ x0: 5, x1: 6, count: 3, label: '5' }]`.

#### Test 6: `binSeries_EmptyInput_ReturnsEmptyArray`
- **Setup**: `binSeries([])` and `binSeries([], { scale: 'log' })`.
- **Assert**: Both return `[]` without throwing.

#### Test 7: `binSeries_NoBinCount_DefaultsToTwentyBins`
- **Setup**: `binSeries(Array.from({ length: 100 }, (_, i) => i))`.
- **Assert**: There are 20 bins. The first is `{ x0: 0, x1: 5, count: 5, label: '0-4' }` and every count is 5. `DEFAULT_BIN_COUNT` is 20.

#### Test 8: `binSeries_CustomBinCount_ReturnsAtMostThatManyBins`
- **Setup**: `binSeries([54, 1, 521, 32, 1, 35], { binCount: 5 })`.
- **Assert**: There are 5 bins, the first labeled `'1-105'`, and the counts sum to 6.

#### Test 9: `binSeries_LogScaleWithZeros_ComputesLogSpacedThresholds`
- **Setup**: `binSeries([0, 0, 1, 10, 100, 1000], { binCount: 10, scale: 'log' })`.
- **Assert**: The `x0`s are `[0, 1, 3, 7, 15, 31, 63, 125, 251, 501]`. The first bin is `{ x0: 0, x1: 1, count: 2, label: '0' }`, the last `x1` is 1001, and the counts sum to 6. Nothing is `NaN`.

#### Test 10: `binSeries_NonFiniteValues_IgnoresThem`
- **Setup**: `binSeries([1, 2, NaN, Infinity])`.
- **Assert**: The counts sum to 2 and every `x0`/`x1` is finite.

### `src/frontend/stores/__tests__/repoStore.test.ts`

Use an MSW `setupServer` with `http.post(/\/api\/repo\//, ...)`, as in `RepoCommits.test.tsx`. Set `process.env.API_URL = 'http://localhost'`. In `beforeEach`, call `resetStores()` from `utils/testUtils`.

#### Test 1: `fetchRepo_SuccessResponse_StoresCommitsAndHasNextPage`
- **Setup**: Return `{ commits: [rowA, rowB], hasNextPage: true }`, then await `fetchRepo(...)`.
- **Assert**: `commits` equals `[rowA, rowB]`, `hasNextPage` is `true`, `status` is `Success` and `error` is `null`.

#### Test 2: `fetchRepo_NullDateAndAuthor_StoresRowsUnchanged`
- **Setup**: Return a row with `date: null, author: null`.
- **Assert**: The stored row has `date === null` and `author === null`.

#### Test 3: `fetchRepo_Started_ResetsCommitsAndSetsPending`
- **Setup**: Preload `commits: [rowA], hasNextPage: true`. Call `fetchRepo` without awaiting it.
- **Assert**: Right after the call, `status` is `Pending`, `commits` is `[]` and `hasNextPage` is `false`. Then await the promise.

#### Test 4: `fetchRepo_ErrorResponse_SetsFailureClearsCommitsAndRethrows`
- **Setup**: Preload previous-repo `commits`/`hasNextPage: true`. The handler returns `HttpResponse.json({}, { status: 500, statusText: 'Internal Server Error' })`.
- **Assert**: `await expect(fetchRepo(...)).rejects.toThrow('Internal Server Error')`. Afterwards `status` is `Failure`, `error.message` is `'Internal Server Error'`, `commits` is `[]` and `hasNextPage` is `false`.

#### Test 5: `fetchRepo_NetworkError_SetsFailureAndRethrows`
- **Setup**: The handler returns `HttpResponse.error()`.
- **Assert**: The promise rejects. `status` is `Failure`, `error` is an `Error`, and `commits` is `[]`.

#### Test 6: `setRepo_WithExistingCommits_ResetsCommitsAndHasNextPage`
- **Setup**: Preload `commits: [rowA], hasNextPage: true, status: Success`, then call `setRepo({ owner: 'o', repository: 'r' })`.
- **Assert**: `owner` is `'o'`, `repository` is `'r'`, `commits` is `[]`, `hasNextPage` is `false` and `status` is `Idle`.

#### Test 7: `clearRepo_WithExistingCommits_ResetsToDefaults`
- **Setup**: Preload commits and an error, then call `clearRepo()`.
- **Assert**: `owner` is `'facebook'`, `repository` is `'react'`, `commits` is `[]`, `hasNextPage` is `false`, `status` is `Idle` and `error` is `null`.

### `src/frontend/features/repo/__tests__/RepoCommits.test.tsx` (rewrite)

The MSW default handler returns `{ commits: [...], hasNextPage: false }` with three rows: (54/32/3), (1/1/1) and (521/35/7), using `date`/`author` strings. Leave `repoInitialState` empty, because `resetStores()` already sets the idle state. Count bars with `container.querySelectorAll('svg rect')`. Read the first x tick with `container.querySelector('.axis--x .tick text')?.textContent`.

#### Test 1: `RepoCommits_AddsDeletesLoaded_RendersSharedBinBarsAndControls`
- **Setup**: Render with `BarGraphAddsDeletes` and token `'AbcDeF123456'`.
- **Assert**: `await screen.findByText(/total commits/i)` resolves. There are 40 rects (20 bins × 2 series), the first x tick is `'1-27'`, and `getByRole('slider', { name: /bins/i })` has value `'20'`.

#### Test 2: `RepoCommits_ChangedFilesLoaded_RendersIndependentBins`
- **Setup**: Render with `BarGraphChangedFiles`.
- **Assert**: After `findByText(/total commits/i)`, there are 7 rects and the first x tick is `'1'`.

#### Test 3: `RepoCommits_BinCountChanged_RebinsWithoutRefetching`
- **Setup**: Track request count in the MSW handler. After the first render, `fireEvent.change(screen.getByRole('slider', { name: /bins/i }), { target: { value: 5 } })`.
- **Assert**: There are 10 rects, the first x tick is `'1-105'`, the label `Bins: 5` is visible, and the request count is still 1.

#### Test 4: `RepoCommits_LogScaleSelected_RedrawsWithLogThresholds`
- **Setup**: After load, `await user.click(screen.getByRole('button', { name: 'Log' }))`.
- **Assert**: The `Log` button has `aria-pressed="true"`, the first x tick changes from `'1-27'` to `'1'`, and rects are still rendered.

#### Test 5: `RepoCommits_Pending_ShowsSpinnerAndNoControls`
- **Setup**: `repoInitialState: { status: Status.Pending }` with token `''`, so no fetch happens.
- **Assert**: `getByRole('progressbar')` is present and `queryByRole('slider')` is null.

#### Test 6: `RepoCommits_FetchFails_ShowsErrorAlert`
- **Setup**: `server.use(http.post(/\/api\/repo\//, () => HttpResponse.json({}, { status: 500, statusText: 'Internal Server Error' })))`.
- **Assert**: `await screen.findByText(/an error ocurred while loading/i)` resolves, there are no rects, and no unhandled rejection is reported.

#### Test 7: `RepoCommits_EmptyCommits_RendersEmptyGraphWithoutControls`
- **Setup**: The handler returns `{ commits: [], hasNextPage: false }`. Wait for `repoStore.getState().status === Status.Success` with `waitFor`.
- **Assert**: There are 0 rects and `queryByRole('slider')` is null.

---

## Verification

```bash
# 1. Build passes
yarn build

# 2. Frontend type check (strict, noUnusedLocals)
yarn tsc -p src/tsconfig.frontend.json --noEmit

# 3. Relevant test files pass
yarn test src/frontend/utils/__tests__/binning.test.ts src/frontend/stores/__tests__/repoStore.test.ts src/frontend/features/repo/__tests__/RepoCommits.test.tsx

# 4. Full suite and lint
yarn test
yarn lint

# 5. No leftover bucketed-shape references
grep -rn "commitData\|CommitData\|createHighRange\|createLowRange\|cloneDeep" src/frontend
```

Manual check with `yarn dev` at `https://localhost:3000`:
1. Log in and load `facebook/react` on `/graphs/repo-additions-deletions`. Green and red bars should sit side by side on one axis, with range labels such as `1-27`.
2. Drag the Bins slider, or focus it and use the arrow keys, from 5 to 50. The chart should redraw at once with no new request in the Network tab. At 50 bins the x-axis labels should be thinned and not overlap.
3. Toggle Log. The low ranges should spread out, and labels should still show real line counts.
4. Open `/graphs/repo-files` and repeat. Load a repository that does not exist and confirm the error alert appears, with no stale bars from the previous repository.
