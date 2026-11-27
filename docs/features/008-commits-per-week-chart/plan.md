# Plan: Commits per Week Chart

## Context

After features 005–007, `repoStore` holds raw `commits: CommitRow[]` and `hasNextPage`. `RepoCommits` passes `RepoGraphProps` (`commits`, `hasNextPage`, `status`) to the graph component a route gives it. Each `CommitRow` has `date: string | null`, which the backend copies from GitHub's ISO-8601 `committedDate` (`src/backend/lib/github/commits.ts`). No chart uses it yet. Feature 007 added the shared scaffolding this chart reuses: `services/chartScaffold.ts` (`createChartFrame`, `drawXAxis`, `drawYAxis`, `CHART_*` constants), `ChartTooltip`, `ChartEmptyState` and `ChartCoverageNote`.

This plan implements `docs/features/008-commits-per-week-chart/requirements.md`. It adds a route, `/graphs/repo-commits-per-week`, with a bar chart of commits per UTC week (Monday start). The x axis is a time scale, and empty weeks inside the range are drawn as zero-height bars. A tooltip works with both the pointer and the keyboard. The chart also shows the date range covered, a note counting undated commits, the "latest N commits" note, and an empty state for when no commit has a usable date. The grouping is a pure utility in `src/frontend/utils/weekly.ts`.

---

## Options Considered

### Option A: Fixed 800×500 viewBox scaled with CSS (the ECDF approach)

Draw at a fixed `CHART_WIDTH`. Let the SVG scale with `width: 100%` and set a `minWidth` so that narrow screens scroll sideways.

**Pros**: It is the same as `EcdfCommitSize`, it needs no measuring, and tests always see one geometry.
**Cons**: Tick thinning cannot react to the real width. At 360 px the whole drawing, text included, either shrinks to about 45% (5–6 px labels) or needs horizontal scrolling. That fails the usability NFR ("labels thin out on narrow widths; readable at 360 px").

### Option B: Measure the container width and lay out at real pixels

A small `useContainerWidth` hook reads the container's width with `ResizeObserver`, as `PlaceholderChart` already does, and falls back to `CHART_WIDTH` when the width is 0 (jsdom) or `ResizeObserver` is missing. The layout gets the real `width`. The viewBox equals that width, so 1 SVG unit = 1 CSS px, and the number of x ticks comes from `innerWidth / MIN_X_TICK_SPACING`.

**Pros**: Labels keep their real font size at any width and thin out on their own. Narrow screens never need horizontal scrolling. The existing `createChartFrame({ width, height })` already accepts a custom size. Tests stay deterministic because jsdom always takes the fallback width.
**Cons**: One extra hook. The chart redraws on resize, which is cheap at about 100 bars.

**Chosen**: Option B. It is the only option that meets the 360 px NFR. It reuses a pattern the codebase already has (`PlaceholderChart`) and the size options of the shared scaffolding.

---

## Files to Create

| File | Purpose |
|---|---|
| `src/frontend/utils/weekly.ts` | Pure grouping: `parseCommitDate` and `groupCommitsByWeek`, plus the `WeekBucket` and `WeeklyCommits` types. It uses `d3.utcMonday` and `d3.rollup`. No DOM and no React. |
| `src/frontend/utils/__tests__/weekly.test.ts` | Unit tests for the grouping, covering every case the NFR lists. |
| `src/frontend/hooks/useContainerWidth.ts` | A hook that returns the element's width from `ResizeObserver`, or a fallback when the width is 0 or the API is missing. |
| `src/frontend/services/weeklyChart.ts` | `chartHeightFor`, `weekTickValues` and `createWeeklyLayout` (pure: scales, slot and bar width, ticks), and `renderWeeklyChart` (draws axes and bars into a `<g>` owned by D3). |
| `src/frontend/services/__tests__/weeklyChart.test.ts` | Unit tests for the layout and tick thinning. |
| `src/frontend/components/CommitsPerWeek.tsx` | The route's graph component (`RepoGraphProps`). It holds the range summary, exclusion note, coverage note, SVG, highlight column and tooltip. |
| `src/frontend/components/__tests__/CommitsPerWeek.test.tsx` | Component tests and an integration test through `RepoCommits`. |

---

## Files to Modify

| File | Change |
|---|---|
| `src/frontend/components/AppRouter.tsx` | Add `const CommitsWeekly = GraphPage(RepoCommits, CommitsPerWeek)` and a `PrivateRoute` for `/graphs/repo-commits-per-week`, built the same way as the `/graphs/repo-commit-size` route. |
| `src/frontend/components/GraphList.tsx` | Replace the `Graph #4` / `Pending` placeholder card with `to="/graphs/repo-commits-per-week"`, title `Commits per Week`, description `Weekly commit activity over the loaded commits`. Note: nothing currently imports `GraphList`. This keeps it in step with the routes, as 007 did. |

No store, type or backend changes are needed. `CommitRow.date` and `RepoGraphProps.hasNextPage` already exist.

---

## Implementation

### 1. `utils/weekly.ts`: pure weekly grouping

```ts
import { extent, rollup, utcMonday } from 'd3'
import { CommitRow } from '../types/commit.types'

export interface WeekBucket {
  /** Monday 00:00:00.000 UTC. */
  weekStart: Date
  count: number
}

export interface WeeklyCommits {
  /** One bucket per week from the first to the last dated commit, gaps filled with count 0. Ascending. */
  weeks: WeekBucket[]
  /** Commits with a valid date (the sum of all bucket counts). */
  datedCount: number
  /** Commits whose date was null, empty or unparseable. */
  excludedCount: number
  /** Earliest and latest valid commit timestamps, or null when there are none. */
  firstDate: Date | null
  lastDate: Date | null
}

/** Parses an ISO-8601 commit date. Returns null for null, non-strings, blank strings and invalid dates. Never throws. */
export function parseCommitDate(value: unknown): Date | null {
  if (typeof value !== 'string' || value.trim() === '') {
    return null
  }
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

export function groupCommitsByWeek(commits: ReadonlyArray<Pick<CommitRow, 'date'>>): WeeklyCommits {
  const dates = commits
    .map((c) => parseCommitDate(c.date))
    .filter((d): d is Date => d !== null)
  const excludedCount = commits.length - dates.length
  const [firstDate, lastDate] = extent(dates)

  if (firstDate === undefined || lastDate === undefined) {
    return { weeks: [], datedCount: 0, excludedCount, firstDate: null, lastDate: null }
  }

  const counts = rollup(dates, (v) => v.length, (d) => utcMonday.floor(d).getTime())
  const weeks = utcMonday
    .range(utcMonday.floor(firstDate), utcMonday.offset(utcMonday.floor(lastDate), 1))
    .map((weekStart) => ({ weekStart, count: counts.get(weekStart.getTime()) ?? 0 }))

  return { weeks, datedCount: dates.length, excludedCount, firstDate, lastDate }
}
```

- `rollup` is keyed by the epoch milliseconds of the week start. `Date` objects are not equal by value, so they cannot be the key.
- `utcMonday.range(start, stop)` is exclusive of `stop`. Offsetting the last week by 1 makes it include the last week, so a single-week input returns exactly one bucket (Requirement 3.3).
- Everything uses the `utc*` intervals, so the output does not depend on the viewer's time zone (Reliability NFR).

### 2. `hooks/useContainerWidth.ts`

```ts
import { useEffect, useState } from 'react'

/** Width of `element` in CSS px. Returns `fallback` until measured, when the width is 0 (jsdom) or without ResizeObserver. */
export function useContainerWidth(element: HTMLElement | null, fallback: number): number {
  const [width, setWidth] = useState(fallback)

  useEffect(() => {
    if (!element) {
      return
    }
    const measure = (w: number) => setWidth(w > 0 ? Math.round(w) : fallback)
    measure(element.clientWidth)
    if (typeof ResizeObserver === 'undefined') {
      return
    }
    const observer = new ResizeObserver(([entry]) => {
      if (entry) {
        measure(entry.contentRect.width)
      }
    })
    observer.observe(element)
    return () => observer.disconnect()
  }, [element, fallback])

  return width
}
```

The component passes a **callback ref** (`useState` setter) as `element`, not a `useRef`. The container only mounts after the pending and empty branches, and a state-backed ref makes the effect run again when it appears.

### 3. `services/weeklyChart.ts`: layout and renderer

```ts
import * as d3 from 'd3'
import { WeekBucket } from '../utils/weekly'
import { CHART_HEIGHT, CHART_MARGINS, ChartFrame, createChartFrame, drawXAxis, drawYAxis } from './chartScaffold'

export const MIN_CHART_WIDTH = 320
export const NARROW_BREAKPOINT = 600
export const NARROW_CHART_HEIGHT = 320
export const MIN_X_TICK_SPACING = 80 // px between x labels
export const MAX_BAR_WIDTH = 48
const BAR_FILL_RATIO = 0.8
const HALF_WEEK_HOURS = 84

export const BAR_COLOR = '#0969da' // 5.2:1 against white

export interface WeeklyLayout {
  width: number
  height: number
  innerWidth: number
  innerHeight: number
  x: d3.ScaleTime<number, number>
  y: d3.ScaleLinear<number, number>
  /** Width of one week on the x axis. All UTC weeks are exactly 7 days, so it is uniform. */
  slotWidth: number
  /** Drawn bar width, centred in its slot. */
  barWidth: number
  /** Week starts to label (already thinned). */
  xTicks: Date[]
  yTicks: number[]
  multiYear: boolean
}

export const chartHeightFor = (width: number): number =>
  width < NARROW_BREAKPOINT ? NARROW_CHART_HEIGHT : CHART_HEIGHT

/** Keeps every k-th week so that labels are at least MIN_X_TICK_SPACING apart. Always keeps the first week. */
export function weekTickValues(weekStarts: Date[], innerWidth: number): Date[] {
  const maxTicks = Math.max(1, Math.floor(innerWidth / MIN_X_TICK_SPACING))
  const step = Math.max(1, Math.ceil(weekStarts.length / maxTicks))
  return weekStarts.filter((_, i) => i % step === 0)
}

/** Pure. Returns null when there are no weeks. */
export function createWeeklyLayout(weeks: WeekBucket[], width: number): WeeklyLayout | null {
  if (weeks.length === 0) {
    return null
  }
  const w = Math.max(MIN_CHART_WIDTH, width)
  const height = chartHeightFor(w)
  const innerWidth = w - CHART_MARGINS.left - CHART_MARGINS.right
  const innerHeight = height - CHART_MARGINS.top - CHART_MARGINS.bottom
  const [{ weekStart: first }] = weeks
  const { weekStart: last } = weeks[weeks.length - 1]

  const x = d3.scaleUtc()
    .domain([first, d3.utcMonday.offset(last, 1)])
    .range([0, innerWidth])
  const maxCount = d3.max(weeks, (d) => d.count) ?? 0
  const y = d3.scaleLinear().domain([0, Math.max(1, maxCount)]).nice().range([innerHeight, 0])
  const slotWidth = innerWidth / weeks.length

  return {
    width: w,
    height,
    innerWidth,
    innerHeight,
    x,
    y,
    slotWidth,
    barWidth: Math.min(MAX_BAR_WIDTH, Math.max(1, slotWidth * BAR_FILL_RATIO)),
    xTicks: weekTickValues(weeks.map((d) => d.weekStart), innerWidth),
    yTicks: y.ticks(Math.min(Math.max(1, maxCount), 8)).filter(Number.isInteger),
    multiYear: first.getUTCFullYear() !== last.getUTCFullYear(),
  }
}

export const formatWeekTick = (multiYear: boolean) =>
  d3.utcFormat(multiYear ? '%b %-d \'%y' : '%b %-d')

export function renderWeeklyChart(
  container: SVGGElement,
  weeks: WeekBucket[],
  layout: WeeklyLayout,
  labels: { x: string; y: string },
): ChartFrame {
  const frame = createChartFrame(container, { width: layout.width, height: layout.height })
  const { x, y, slotWidth, barWidth, innerHeight } = layout
  const formatTick = formatWeekTick(layout.multiYear)

  // Ticks sit at mid-week so each label lines up under its centred bar. The label text is the week start.
  drawXAxis(
    frame,
    d3.axisBottom<Date>(x)
      .tickValues(layout.xTicks.map((d) => d3.utcHour.offset(d, HALF_WEEK_HOURS)))
      .tickFormat((d) => formatTick(d3.utcMonday.floor(d))),
    labels.x,
  )
  drawYAxis(frame, d3.axisLeft<number>(y).tickValues(layout.yTicks).tickFormat(d3.format('d')), labels.y)

  frame.root.append('g').attr('class', 'weekly-bars')
    .selectAll('rect.weekly-bar')
    .data(weeks)
    .join('rect')
    .attr('class', 'weekly-bar')
    .attr('data-week', (d) => d.weekStart.toISOString())
    .attr('data-count', (d) => d.count)
    .attr('x', (d) => x(d.weekStart) + (slotWidth - barWidth) / 2)
    .attr('width', barWidth)
    .attr('y', (d) => y(d.count))
    .attr('height', (d) => innerHeight - y(d.count)) // 0 for empty weeks (Requirement 1.2)
    .attr('fill', BAR_COLOR)

  return frame
}
```

Notes:
- `prefer-destructuring` (with `enforceForRenamedProperties`) and `curly: all` are enforced in `eslint.config.mjs`. The snippets follow both rules.
- `y`'s domain is `[0, …]`, so the y axis always starts at zero (Requirement 1.3). `Math.max(1, …)` guards against a degenerate `[0, 0]` domain, although a non-empty `weeks` always has at least one commit.
- In the single-week case, `slotWidth` covers the whole plot. `MAX_BAR_WIDTH` keeps that one bar from filling the chart, and it is centred (Requirement 3.3).

### 4. `components/CommitsPerWeek.tsx`

Module constants:

```ts
const X_LABEL = 'Week starting (UTC)'
const Y_LABEL = 'Commits'
const formatDay = d3.utcFormat('%b %-d, %Y')
const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`
```

Component outline:

```tsx
const CommitsPerWeek: React.FC<RepoGraphProps> = ({ commits, hasNextPage, status }) => {
  const [container, setContainer] = useState<HTMLDivElement | null>(null)
  const [active, setActive] = useState<number | null>(null)
  const plotRef = useRef<SVGGElement>(null)
  const tooltipId = useId()
  const width = useContainerWidth(container, CHART_WIDTH)

  const weekly = useMemo(() => groupCommitsByWeek(commits), [commits])
  const { weeks, datedCount, excludedCount, firstDate, lastDate } = weekly
  const layout = useMemo(() => createWeeklyLayout(weeks, width), [weeks, width])

  useEffect(() => {
    if (plotRef.current && layout) {
      renderWeeklyChart(plotRef.current, weeks, layout, { x: X_LABEL, y: Y_LABEL })
    }
  }, [weeks, layout])

  // Reset the cursor when the data changes so it never points past the end.
  useEffect(() => setActive(null), [weeks])

  if (status === Status.Pending) {
    return <CircularProgress sx={{ display: 'block', mx: 'auto', my: 8 }} />
  }
  if (commits.length === 0) {
    return <ChartEmptyState />
  }

  const exclusionNote = excludedCount > 0 && (
    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
      {plural(excludedCount, 'commit')} without a valid date {excludedCount === 1 ? 'is' : 'are'} not shown.
    </Typography>
  )

  if (!layout || !firstDate || !lastDate) {
    return (
      <Box>
        <ChartEmptyState message="No dated commits are available for this repository." />
        {exclusionNote}
      </Box>
    )
  }
  // ... handlers and JSX below
}
```

All hooks run before the early returns, as in `EcdfCommitSize`.

**Summary, notes and coverage** (HTML above the chart):

```tsx
<Typography variant="body2" sx={{ mb: 1 }}>
  {plural(datedCount, 'commit')} from {formatDay(firstDate)} to {formatDay(lastDate)}
</Typography>
{exclusionNote}
<ChartCoverageNote hasNextPage={hasNextPage} count={commits.length} />
```

This covers Requirement 3.1 (first and last dates), 2.2 (exclusion note) and 3.2 ("This chart covers the latest N commits only.").

**Handlers:**

```ts
const { left: marginLeft, top: marginTop } = CHART_MARGINS
const lastIndex = weeks.length - 1

const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
  const rect = e.currentTarget.getBoundingClientRect()
  if (rect.width === 0) {
    return
  }
  const px = ((e.clientX - rect.left) / rect.width) * layout.width - marginLeft
  const index = Math.floor(px / layout.slotWidth)
  setActive(index >= 0 && index <= lastIndex ? index : null)
}

const handleKeyDown = (e: React.KeyboardEvent<SVGSVGElement>) => {
  let next: number | null
  switch (e.key) {
    case 'ArrowRight': next = active === null ? 0 : Math.min(lastIndex, active + 1); break
    case 'ArrowLeft': next = active === null ? 0 : Math.max(0, active - 1); break
    case 'Home': next = 0; break
    case 'End': next = lastIndex; break
    case 'Escape': next = null; break
    default: return
  }
  e.preventDefault()
  setActive(next)
}
```

The pointer is mapped to a week **slot**, not to a `<rect>`. That way zero-height weeks can also be hovered, and the hit area is the full column height.

**Chart:**

```tsx
const activeWeek = active === null ? null : weeks[active]
const slotX = active === null ? 0 : marginLeft + active * layout.slotWidth

<Box ref={setContainer} sx={{ position: 'relative', width: '100%', minWidth: 0 }}>
  <svg
    viewBox={`0 0 ${layout.width} ${layout.height}`}
    style={{ display: 'block', width: '100%', height: 'auto' }}
    role="img"
    aria-label={`Bar chart of commits per week from ${formatDay(firstDate)} to ${formatDay(lastDate)}: ${plural(datedCount, 'commit')} across ${plural(weeks.length, 'week')}. Use the left and right arrow keys to read weekly counts.`}
    aria-describedby={activeWeek ? tooltipId : undefined}
    tabIndex={0}
    onPointerMove={handlePointerMove}
    onPointerLeave={() => setActive(null)}
    onFocus={() => setActive(lastIndex)}
    onBlur={() => setActive(null)}
    onKeyDown={handleKeyDown}
  >
    <g ref={plotRef} />
    {activeWeek && (
      <rect
        className="weekly-highlight"
        x={slotX} y={marginTop} width={layout.slotWidth} height={layout.innerHeight}
        fill="#24292f" fillOpacity={0.08} pointerEvents="none"
      />
    )}
  </svg>
  <ChartTooltip
    id={tooltipId}
    open={activeWeek !== null}
    leftPct={((slotX + layout.slotWidth / 2) / layout.width) * 100}
    topPct={((marginTop + layout.innerHeight / 2) / layout.height) * 100}
  >
    {activeWeek && (
      <>
        <strong>Week of {formatDay(activeWeek.weekStart)}</strong>
        <div>{plural(activeWeek.count, 'commit')}</div>
      </>
    )}
  </ChartTooltip>
</Box>
```

- The viewBox width is the measured container width, so the drawing is 1:1 in CSS pixels. The pointer and tooltip maths stay the same single-ratio percentages that 007 uses.
- Focusing the chart starts at the most recent week (`lastIndex`). That is the week a user most likely wants first.
- The `aria-label` is the text alternative that summarises the total and the range (Usability NFR).
- `ref={setContainer}` is a callback ref, so `useContainerWidth` re-measures as soon as the container mounts.

### 5. `AppRouter.tsx` and `GraphList.tsx`

```tsx
import CommitsPerWeek from './CommitsPerWeek'
// ...
const CommitsWeekly = GraphPage(RepoCommits, CommitsPerWeek)
// ...
<Route
  path="/graphs/repo-commits-per-week"
  element={
    <PrivateRoute path="/graphs/repo-commits-per-week" pathname={pathname} search={search}>
      <CommitsWeekly />
    </PrivateRoute>
  }
/>
```

```tsx
<ImageListItem>
  <CustomCard
    to="/graphs/repo-commits-per-week"
    title="Commits per Week"
    description="Weekly commit activity over the loaded commits"
  />
</ImageListItem>
```

---

## Key Technical Decisions

- **`d3.utcMonday`, not `d3.timeWeek`**: `timeWeek` is an alias for `timeSunday`, which counts weeks from Sunday in local time. That breaks both the Monday-start rule and the UTC rule in Requirement 1.1. `utcMonday` gives both, and UTC weeks are always exactly 7 × 24 h, so the slot width is uniform.
- **`new Date(iso)` + `isNaN` check instead of `d3.isoParse`**: The result is the same (both return no date for bad input). The explicit helper also rejects non-strings and blank strings, and it is easy to test. GitHub's `committedDate` always carries a `Z`/offset. A string with no offset would be read as local time, but the API never returns one.
- **Gap filling with `utcMonday.range`**: Generating every week between the first and last week, then looking up counts in the `rollup` map, gives a continuous axis (Requirement 1.2) in O(weeks + commits).
- **Time scale with centred bars and mid-week ticks**: The requirements ask for a time-scale axis (1.3), so `scaleBand` is out. Bars are centred in their 7-day slot and capped at 48 px. Ticks are placed at mid-week (+84 h) and labelled with `utcMonday.floor(tick)`, so every label sits under its bar and still shows the week start date.
- **Tick thinning by measured width**: `weekTickValues` keeps every k-th week so labels are at least 80 px apart. At 360 px (about 280 px inner) that leaves 3 labels. At 800 px it leaves 9 labels.
- **The slot, not the bar, is the hover target, and there is one focus stop**: Zero-height bars cannot be hovered as `<rect>`s, and 100+ weeks would mean 100+ tab stops. Slot-based pointer mapping and arrow-key navigation on one focusable `svg` solve both. This matches the ECDF interaction model.
- **Separate empty states**: No rows at all keeps the shared default ("No commits to display…"). Rows that exist but have no valid date show "No dated commits are available for this repository." together with the exclusion count (Requirements 2.2 and 2.3).

---

## Tests to Add

Follow the existing convention: `describe` per unit, with `it('MethodName_Condition_ExpectedOutcome')`.

### `src/frontend/utils/__tests__/weekly.test.ts`

Helper: `const at = (date: string | null) => ({ date })`.

#### Test 1: `groupCommitsByWeek_CommitsInSameWeek_ReturnsOneBucketWithCount`
- **Setup**: Dates `2024-01-08T10:00:00Z` (Mon), `2024-01-10T12:00:00Z` (Wed), `2024-01-14T23:59:59Z` (Sun).
- **Assert**: `weeks` equals `[{ weekStart: new Date('2024-01-08T00:00:00Z'), count: 3 }]`. `datedCount` is 3 and `excludedCount` is 0.

#### Test 2: `groupCommitsByWeek_GapWeeks_FillsMissingWeeksWithZero`
- **Setup**: `2024-01-08T10:00:00Z` and `2024-01-29T10:00:00Z`.
- **Assert**: The `weekStart` ISO strings are `2024-01-08`, `-15`, `-22`, `-29` (all `T00:00:00.000Z`). The counts are `[1, 0, 0, 1]`.

#### Test 3: `groupCommitsByWeek_NullAndInvalidDates_ExcludesAndCountsThem`
- **Setup**: `[at('2024-01-08T10:00:00Z'), at(null), at('not a date'), at(''), at('2024-13-45T00:00:00Z')]`.
- **Assert**: Nothing throws. `datedCount` is 1, `excludedCount` is 4, and there is one bucket with count 1.

#### Test 4: `groupCommitsByWeek_SundayMondayBoundaryUtc_SplitsIntoTwoWeeks`
- **Setup**: `2024-01-14T23:59:59.999Z` (Sun), `2024-01-15T00:00:00Z` (Mon), and `2024-01-15T00:30:00+01:00` (which is Sun 23:30 UTC).
- **Assert**: Two buckets. Week `2024-01-08` has count 2 (the Sunday commit and the `+01:00` commit). Week `2024-01-15` has count 1.

#### Test 5: `groupCommitsByWeek_SingleWeek_ReturnsSingleBucketAndRange`
- **Setup**: One commit, `2024-03-06T08:00:00Z`.
- **Assert**: `weeks` has length 1 with `weekStart` `2024-03-04T00:00:00.000Z`. `firstDate` and `lastDate` both equal the commit's date.

#### Test 6: `groupCommitsByWeek_EmptyInput_ReturnsEmptyResult`
- **Assert**: `groupCommitsByWeek([])` equals `{ weeks: [], datedCount: 0, excludedCount: 0, firstDate: null, lastDate: null }`.

#### Test 7: `groupCommitsByWeek_AllDatesInvalid_ReturnsNoWeeksWithExcludedCount`
- **Setup**: `[at(null), at('x')]`.
- **Assert**: `weeks` is `[]`, `excludedCount` is 2, and `firstDate` is null.

#### Test 8: `groupCommitsByWeek_UnsortedInput_ReturnsAscendingWeeksAndExtent`
- **Setup**: `2024-02-05T00:00:00Z`, `2024-01-08T00:00:00Z`, `2024-01-22T00:00:00Z`.
- **Assert**: The first `weekStart` is `2024-01-08`, the last is `2024-02-05`, and the counts sum to 3. `firstDate` and `lastDate` are the min and max.

#### Test 9: `parseCommitDate_NonStringOrBlank_ReturnsNull`
- **Assert**: `parseCommitDate(undefined)`, `parseCommitDate(42)` and `parseCommitDate('   ')` are all `null`. `parseCommitDate('2024-01-08T00:00:00Z')?.toISOString()` is `'2024-01-08T00:00:00.000Z'`.

### `src/frontend/services/__tests__/weeklyChart.test.ts`

Helper: `weeksOf(counts: number[])` builds consecutive `WeekBucket`s that start at `2024-01-08T00:00:00Z`.

#### Test 1: `createWeeklyLayout_NoWeeks_ReturnsNull`
- **Assert**: `createWeeklyLayout([], 800)` is `null`.

#### Test 2: `createWeeklyLayout_Weeks_YDomainStartsAtZeroWithIntegerTicks`
- **Setup**: `createWeeklyLayout(weeksOf([3, 0, 7]), 800)`.
- **Assert**: `y.domain()[0]` is 0 and `y.domain()[1]` ≥ 7. Every value in `yTicks` is an integer, and `yTicks` includes 0.

#### Test 3: `createWeeklyLayout_Weeks_SlotsTileXRange`
- **Setup**: `weeksOf([1, 2, 3, 4])` at 800.
- **Assert**: `slotWidth` is `innerWidth / 4`. `x(weeks[2].weekStart)` is close to `2 * slotWidth` (`toBeCloseTo`).

#### Test 4: `createWeeklyLayout_SingleWeek_CapsBarWidth`
- **Setup**: `weeksOf([5])` at 800.
- **Assert**: `slotWidth` is `innerWidth`, and `barWidth` is `MAX_BAR_WIDTH`.

#### Test 5: `createWeeklyLayout_NarrowWidth_UsesNarrowHeightAndFewerTicks`
- **Setup**: `weeksOf(Array(20).fill(1))` at 360 and at 800.
- **Assert**: At 360, `height` is `NARROW_CHART_HEIGHT` and `xTicks.length` ≤ 3. At 800, `xTicks.length` is greater than at 360 and ≤ 9.

#### Test 6: `createWeeklyLayout_BelowMinWidth_ClampsToMinChartWidth`
- **Assert**: `createWeeklyLayout(weeksOf([1]), 100)!.width` is `MIN_CHART_WIDTH`.

#### Test 7: `weekTickValues_FewWeeks_KeepsAllWeeks`
- **Assert**: For 3 week starts at `innerWidth` 720, all 3 are returned. For 30 week starts at 280, the first is always kept and no more than 3 are returned.

### `src/frontend/components/__tests__/CommitsPerWeek.test.tsx`

Render `<CommitsPerWeek commits={rows} hasNextPage={false} status={Status.Success} />` directly. jsdom reports `clientWidth` 0, so the chart uses the 800 px fallback. Fixture `rows`: commits dated `2024-01-08T10:00:00Z`, `2024-01-09T10:00:00Z`, `2024-01-29T10:00:00Z`, plus one with `date: null`. A `row(oid, date)` helper fills in the other `CommitRow` fields.

#### Test 1: `CommitsPerWeek_Rows_RendersOneBarPerWeekIncludingZeroWeeks`
- **Assert**: There are 4 `rect.weekly-bar` elements. Their `data-count` values are `['2', '0', '0', '1']`. The zero bars have `height="0"`. The text "Week starting (UTC)" and "Commits" is present, and `.axis--x .tick text` contains `Jan 8`.

#### Test 2: `CommitsPerWeek_Rows_ShowsDateRangeAndTextAlternative`
- **Assert**: The text `3 commits from Jan 8, 2024 to Jan 29, 2024` is present. `getByRole('img')` has an accessible name that matches `/3 commits across 4 weeks/`.

#### Test 3: `CommitsPerWeek_UndatedCommit_ShowsExclusionNote`
- **Assert**: `1 commit without a valid date is not shown.` is present. With every row dated, the note is absent.

#### Test 4: `CommitsPerWeek_KeyboardFocus_ShowsTooltipAndArrowsMoveWeek`
- **Setup**: Focus `getByRole('img')`, then `await user.keyboard('{Home}')`, then `{ArrowRight}`.
- **Assert**: After focus, the tooltip contains `Week of Jan 29, 2024` and `1 commit`. After Home, it shows `Week of Jan 8, 2024` and `2 commits`. After ArrowRight, it shows `Week of Jan 15, 2024` and `0 commits`. The svg's `aria-describedby` equals the tooltip `id`. After `{Escape}`, `queryByRole('tooltip')` is null, and so is `.weekly-highlight`.

#### Test 5: `CommitsPerWeek_PointerMove_ShowsTooltipForHoveredWeek`
- **Setup**: Stub `svg.getBoundingClientRect` to return `{ left: 0, width: 800, … }`. Fire `pointerMove` with `clientX = CHART_MARGINS.left + slotWidth * 3.5`, where slotWidth = 720 / 4.
- **Assert**: The tooltip shows `Week of Jan 29, 2024`. Fire `pointerLeave` and the tooltip is gone.

#### Test 6: `CommitsPerWeek_AllDatesInvalid_ShowsDatedEmptyStateAndNote`
- **Setup**: Two rows, with `date: null` and `date: 'garbage'`.
- **Assert**: `getByRole('status')` has the text `No dated commits are available for this repository.`. `2 commits without a valid date are not shown.` is present. `container.querySelector('svg[role="img"]')` is null.

#### Test 7: `CommitsPerWeek_NoCommits_ShowsDefaultEmptyState`
- **Assert**: `getByRole('status')` matches `/no commits to display/i`, and there is no `.axis`.

#### Test 8: `CommitsPerWeek_SingleWeek_RendersSingleBarWithoutError`
- **Setup**: Two commits in the week of `2024-03-04`.
- **Assert**: There is one `rect.weekly-bar`. Its `width` is `48` and its `x` is not `NaN`.

#### Test 9: `CommitsPerWeek_HasNextPage_ShowsLatestCommitsNote`
- **Assert**: With `hasNextPage={true}`, `This chart covers the latest 4 commits only.` is present. With `false`, it is absent.

#### Test 10: `CommitsPerWeek_Pending_ShowsSpinner`
- **Assert**: `getByRole('progressbar')` is present, and there is no `role="status"`.

#### Test 11: `CommitsPerWeek_100Commits_GroupsAndDrawsUnder50ms`
- **Setup**: 100 rows with random dates over the 2 years before `2024-06-01Z` (about 104 weeks). Use a detached `<svg><g/></svg>` as in the ECDF perf test.
- **Assert**: `groupCommitsByWeek` + `createWeeklyLayout(…, 800)` + `renderWeeklyChart` together take under 50 ms (`performance.now()`). The `rect.weekly-bar` count equals `weeks.length`.

#### Test 12: `RepoCommits_WeeklyRoute_FetchesAndRendersBars` (separate `describe` with MSW)
- **Setup**: `http.post(/\/api\/repo\//)` returns `{ commits: rows, hasNextPage: true }`. Render `renderWithStores(<RepoCommits graphComponent={CommitsPerWeek} />, { userInitialState: { token: 'AbcDeF123456' } })`. Call `resetStores()` in `beforeEach`. This is the same pattern as `EcdfCommitSize.test.tsx`.
- **Assert**: `await findByText(/latest 4 commits/i)` resolves, then `waitFor` 4 `rect.weekly-bar`.

---

## Verification

```bash
# 1. Build passes
yarn build

# 2. Frontend type check
yarn tsc -p src/tsconfig.frontend.json --noEmit

# 3. Relevant test files pass
yarn test src/frontend/utils/__tests__/weekly.test.ts src/frontend/services/__tests__/weeklyChart.test.ts src/frontend/components/__tests__/CommitsPerWeek.test.tsx

# 4. Full suite and lint
yarn test
yarn lint
```

Manual check with `yarn dev` at `https://localhost:3000`:
1. Log in and open `/graphs/repo-commits-per-week` for `facebook/react`. You should see blue bars per week with a continuous axis (gaps as empty slots), a y axis from 0, the "N commits from … to …" line, and the "latest 100 commits" note.
2. Hover across the chart, including empty weeks. The column highlight and tooltip (`Week of …`, `N commits`) should follow the pointer.
3. Press Tab to focus the chart. Focus should start at the latest week. ←/→/Home/End move between weeks, and Escape hides the tooltip.
4. In DevTools device mode at 360 px wide: labels thin to about 3 and keep their normal size, the chart is shorter, and there is no horizontal scroll. Resize the window back up and more labels appear.
5. Change the system time zone (or run Chrome with `TZ=Pacific/Kiritimati`) and reload. The bars and week labels should be identical.
