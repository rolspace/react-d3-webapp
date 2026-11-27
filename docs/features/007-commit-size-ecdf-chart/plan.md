# Plan: Commit Size ECDF Chart

## Context

Feature 006 (`docs/features/006-frontend-commit-data-binning/plan.md`) moves the frontend onto raw rows. After it, `repoStore` holds `commits: CommitRow[]` and `hasNextPage`. `RepoCommits` passes `RepoGraphProps` (`commits`, `hasNextPage`, `status`) to whichever graph component a route gives it. `src/frontend/utils/binning.ts` exports `BinScale` and `LOG_OFFSET`, and `HistogramControls` holds the Linear/Log toggle. **This plan assumes 006 is merged first.** It builds on all of those symbols.

This plan implements `docs/features/007-commit-size-ecdf-chart/requirements.md`. It adds a new route, `/graphs/repo-commit-size`, that shows an empirical cumulative distribution (ECDF) of commit size. The chart draws one step per distinct value and has a metric selector (Adds + Deletes, Additions, Deletions, Changed files) and a Linear/Log toggle. It also has median and 90th-percentile reference lines and a tooltip that works with both the pointer and the keyboard. The ECDF math is a pure utility in `src/frontend/utils/ecdf.ts`.

This is the first chart to need a tooltip, an empty state or a "latest N commits" note. Features 008–011 need all three. So this plan also pulls the shared chart scaffolding (margins, frame, axes) out of `services/bargraph.ts` into one module, and adds reusable `ChartTooltip`, `ChartEmptyState` and `ChartCoverageNote` components.

---

## Options Considered

### Option A: A D3 renderer service, a pure layout, and React for interaction

`createEcdfLayout()` is a pure function that builds the x and y scales and the tick values from the series. `renderEcdfChart()` lives in `services/ecdfChart.ts`, as `renderBarGraph` does, and draws the axes, reference lines, step paths and step markers into a `<g>` that D3 owns. The React component owns the metric, scale and cursor state. It draws the cursor line, as a sibling `<line>` in the same `<svg>`, and the HTML tooltip.

**Pros**: It follows the existing component + `services/*.ts` renderer split. The layout can be unit-tested without a DOM. Hover and keyboard updates re-render only the cursor and tooltip, not the D3 drawing. Tooltip text is rendered by React as text nodes, never as HTML, which is what 010/011 require.
**Cons**: Pointer coordinates have to be mapped from CSS pixels to viewBox units by hand.

### Option B: Everything inside D3, including the tooltip and pointer handlers

D3 attaches `mousemove`/`keydown` listeners and writes the tooltip with `.text()` into a `<g>` or a `<div>`.

**Pros**: All chart code sits in one file.
**Cons**: D3 owns focus handling and ARIA wiring, which is harder to test with Testing Library. Each listener has to be re-bound on every redraw. A tooltip written by D3 cannot be shared as a React component with features 008–011.

**Chosen**: Option A. It matches the existing `BarGraph`/`renderBarGraph` pattern, keeps the ECDF and layout logic pure, and produces a `ChartTooltip` that the next four charts can reuse.

---

## Files to Create

| File | Purpose |
|---|---|
| `src/frontend/utils/ecdf.ts` | Pure ECDF functions: `computeEcdf`, `ecdfAt`, `ecdfQuantile`, `ecdfStops`, plus the `Ecdf`/`EcdfStep` types. No React and no D3 DOM code. It imports only `bisector` from `d3`. |
| `src/frontend/utils/__tests__/ecdf.test.ts` | Unit tests for the ECDF utility. |
| `src/frontend/services/chartScaffold.ts` | Shared chart scaffolding: `CHART_WIDTH`, `CHART_HEIGHT`, `CHART_MARGINS`, `createChartFrame`, `clearChart`, `drawXAxis`, `drawYAxis`. The code comes out of `bargraph.ts` so that it is not duplicated. |
| `src/frontend/services/ecdfChart.ts` | `createEcdfLayout` (pure scales, domain and ticks) and `renderEcdfChart` (draws into a `<g>`). Also holds the `EcdfSeries`/`EcdfLayout` types. |
| `src/frontend/services/__tests__/ecdfChart.test.ts` | Unit tests for `createEcdfLayout`: the domain, the all-equal padding, log ticks and zero handling. |
| `src/frontend/components/ChartTooltip.tsx` | A generic HTML tooltip positioned by percentage over a chart container. It uses `role="tooltip"` and `aria-live="polite"`, and its content is React children. |
| `src/frontend/components/ChartEmptyState.tsx` | The standard empty state: an MUI `Alert severity="info" role="status"` with the default text "No commits to display for this repository." |
| `src/frontend/components/ChartCoverageNote.tsx` | When `hasNextPage` is true, shows "This chart covers the latest N commits only." Otherwise it renders `null`. |
| `src/frontend/components/ScaleToggle.tsx` | The Linear/Log `ToggleButtonGroup`, moved out of `HistogramControls` so that the histograms and the ECDF share one control. |
| `src/frontend/components/EcdfCommitSize.tsx` | The route's graph component. It takes `RepoGraphProps`. It holds the metric selector, scale toggle, legend with quantile summary, coverage note, SVG, cursor and tooltip. |
| `src/frontend/components/__tests__/EcdfCommitSize.test.tsx` | Component and integration tests. |

---

## Files to Modify

| File | Change |
|---|---|
| `src/frontend/services/bargraph.ts` | Delete the private `margins`, `xLabelMargin`, `yLabelMargin` and the inline axis and axis-label code. Use `clearChart`, `createChartFrame`, `drawXAxis` and `drawYAxis` from `chartScaffold.ts`. The output stays the same: the same classes (`axis axis--x`, `axis axis--y`), label positions and font size. One fix comes with the refactor: the translate becomes `(left, top)` instead of `(top, left)`. Both values are 40, so nothing moves on screen. |
| `src/frontend/components/HistogramControls.tsx` | Replace the inline `ToggleButtonGroup` with `<ScaleToggle value={scale} onChange={onScaleChange} />`. Behavior and labels stay the same, so the 006 tests keep passing. |
| `src/frontend/components/AppRouter.tsx` | Add `const CommitSize = GraphPage(RepoCommits, EcdfCommitSize)` and a `PrivateRoute` for `/graphs/repo-commit-size`, in the same shape as the two existing graph routes. |
| `src/frontend/components/GraphList.tsx` | Replace the `Graph #3` placeholder card with `to="/graphs/repo-commit-size"`, title `Commit Size Distribution`, description `Share of commits at or below each size`. |

No store, type or backend changes are needed. `RepoGraphProps` from 006 already carries `commits`, `hasNextPage` and `status`.

---

## Implementation

### 1. `utils/ecdf.ts`: pure ECDF computation

```ts
import { bisector } from 'd3'

export interface EcdfStep {
  /** A distinct metric value. */
  value: number
  /** Number of commits with exactly this value. */
  count: number
  /** Number of commits with a value <= `value`. */
  cumulativeCount: number
  /** cumulativeCount / total, in (0, 1]. The last step is exactly 1. */
  fraction: number
}

export interface Ecdf {
  steps: EcdfStep[]
  /** Number of valid (finite numeric) values. */
  total: number
}

// Absorbs floating-point error in p * total (for example 0.9 * n).
const QUANTILE_EPSILON = 1e-9

const isFiniteNumber = (v: unknown): v is number =>
  typeof v === 'number' && Number.isFinite(v)

const byValue = bisector<EcdfStep, number>((s) => s.value)

/** Builds the ECDF of `values`. Null, undefined, NaN, ±Infinity and non-numbers are skipped. */
export function computeEcdf(values: ReadonlyArray<unknown>): Ecdf {
  const sorted = values.filter(isFiniteNumber).sort((a, b) => a - b)
  const total = sorted.length
  const steps: EcdfStep[] = []

  sorted.forEach((value, i) => {
    const cumulativeCount = i + 1
    const fraction = cumulativeCount / total
    const last = steps[steps.length - 1]
    if (last && last.value === value) {
      last.count += 1
      last.cumulativeCount = cumulativeCount
      last.fraction = fraction
    } else {
      steps.push({ value, count: 1, cumulativeCount, fraction })
    }
  })

  return { steps, total }
}

/** F(x): the share of values <= x. Returns 0 for an empty ECDF. */
export function ecdfAt({ steps }: Ecdf, x: number): number {
  const i = byValue.right(steps, x)
  return i === 0 ? 0 : steps[i - 1].fraction
}

/**
 * The inverse ECDF (type-1 quantile): the smallest observed value v with F(v) >= p.
 * Returns null for an empty ECDF or for p outside (0, 1].
 */
export function ecdfQuantile({ steps, total }: Ecdf, p: number): number | null {
  if (total === 0 || !(p > 0 && p <= 1)) {
    return null
  }
  const target = p * total - QUANTILE_EPSILON
  return steps.find((s) => s.cumulativeCount >= target)?.value ?? null
}

/** The sorted union of distinct values across several ECDFs. These are the keyboard cursor stops. */
export function ecdfStops(ecdfs: Ecdf[]): number[] {
  return Array.from(new Set(ecdfs.flatMap((e) => e.steps.map((s) => s.value)))).sort((a, b) => a - b)
}
```

- `.filter()` returns a new array, so `.sort()` never changes the caller's data.
- Sorting is O(n log n). For 100 rows this takes microseconds, well inside the 50 ms budget.

### 2. `services/chartScaffold.ts`: shared margins, frame and axes

```ts
import * as d3 from 'd3'

export interface ChartMargins { top: number; right: number; bottom: number; left: number }

export const CHART_WIDTH = 800
export const CHART_HEIGHT = 500
export const CHART_MARGINS: ChartMargins = { top: 40, right: 40, bottom: 40, left: 40 }

const AXIS_LABEL_FONT_SIZE = '0.813rem'
const X_LABEL_OFFSET = 35
const Y_LABEL_OFFSET = 50

export interface ChartFrame {
  root: d3.Selection<SVGGElement, unknown, null, undefined>
  innerWidth: number
  innerHeight: number
  margins: ChartMargins
}

interface FrameOptions { width?: number; height?: number; margins?: ChartMargins }

export function clearChart(container: SVGElement): void {
  d3.select(container).selectAll('*').remove()
}

/** Clears `container` and appends a translated root <g> sized to the inner plot area. */
export function createChartFrame(
  container: SVGElement,
  { width = CHART_WIDTH, height = CHART_HEIGHT, margins = CHART_MARGINS }: FrameOptions = {},
): ChartFrame {
  clearChart(container)
  const root = d3.select(container)
    .append('g')
    .attr('transform', `translate(${margins.left}, ${margins.top})`)
  return {
    root,
    innerWidth: width - margins.left - margins.right,
    innerHeight: height - margins.top - margins.bottom,
    margins,
  }
}

export function drawXAxis<D extends d3.AxisDomain>(frame: ChartFrame, axis: d3.Axis<D>, label: string): void {
  frame.root.append('g')
    .attr('class', 'axis axis--x')
    .attr('transform', `translate(0, ${frame.innerHeight})`)
    .call(axis)
  frame.root.append('text')
    .attr('class', 'axis-label axis-label--x')
    .attr('transform', `translate(${frame.innerWidth / 2}, ${frame.innerHeight + X_LABEL_OFFSET})`)
    .style('text-anchor', 'middle')
    .style('font-size', AXIS_LABEL_FONT_SIZE)
    .text(label)
}

export function drawYAxis<D extends d3.AxisDomain>(frame: ChartFrame, axis: d3.Axis<D>, label: string): void {
  frame.root.append('g').attr('class', 'axis axis--y').call(axis)
  frame.root.append('text')
    .attr('class', 'axis-label axis-label--y')
    .attr('transform', 'rotate(-90)')
    .attr('x', -frame.innerHeight / 2)
    .attr('y', -Y_LABEL_OFFSET)
    .attr('dy', '1em')
    .style('text-anchor', 'middle')
    .style('font-size', AXIS_LABEL_FONT_SIZE)
    .text(label)
}
```

### 3. `services/bargraph.ts`: use the scaffolding

These changes apply to the post-006 version of the file.

Before (006 state):

```ts
d3.select(svgElement).selectAll('*').remove()
if (sets.every((set) => !set.length)) { return }
const { colors, height, width } = style
const innerNode = d3.select(svgElement).append('g')
innerNode.attr('transform', `translate(${margins.top}, ${margins.left})`)
const graphHeight = height - margins.top - margins.bottom
const graphWidth = width - margins.right - margins.left
// ... innerNode.append('g').attr('class', 'axis axis--x') ... .text(style.xAxisLabel) ...
```

After:

```ts
if (sets.every((set) => !set.length)) {
  clearChart(svgElement)
  return
}
const { colors, height, width } = style
const frame = createChartFrame(svgElement, { width, height })
const { root: innerNode, innerHeight: graphHeight } = frame
// ... scales unchanged ...
drawXAxis(frame, d3.axisBottom(xScale[0]).tickValues(/* 006 tick thinning, unchanged */), style.xAxisLabel)
drawYAxis(frame, d3.axisLeft(yScale).ticks(9), style.yAxisLabel)
// renderBarGraphSet calls unchanged
```

Delete the `Margins` interface, `margins`, `xLabelMargin`, `yLabelMargin` and `graphWidth`. `frame.innerWidth` gives the same x-label position as `graphWidth` did.

### 4. `services/ecdfChart.ts`: layout and renderer

```ts
import * as d3 from 'd3'
import { BinScale, LOG_OFFSET } from '../utils/binning'
import { Ecdf } from '../utils/ecdf'
import { ChartFrame, createChartFrame, drawXAxis, drawYAxis, CHART_HEIGHT, CHART_MARGINS, CHART_WIDTH } from './chartScaffold'

export interface EcdfSeries {
  key: 'additions' | 'deletions' | 'changedFiles'
  label: string
  color: string
  /** SVG stroke-dasharray. It gives a second cue besides color. */
  dash?: string
  ecdf: Ecdf
  median: number | null
  p90: number | null
}

export interface EcdfLayout {
  x: d3.ScaleContinuousNumeric<number, number>
  y: d3.ScaleLinear<number, number>
  domain: [number, number]
  xTicks: number[] | null // null means use the scale's default ticks
  innerWidth: number
  innerHeight: number
}

export const REFERENCE_QUANTILES = [
  { p: 0.5, label: 'Median' },
  { p: 0.9, label: '90th percentile' },
] as const

const innerWidth = CHART_WIDTH - CHART_MARGINS.left - CHART_MARGINS.right
const innerHeight = CHART_HEIGHT - CHART_MARGINS.top - CHART_MARGINS.bottom

/** [0, 1, 10, 100, ...] clipped to the domain. Falls back to the domain ends if fewer than 2 remain. */
export function logTickValues([lo, hi]: [number, number]): number[] {
  const maxExp = hi > 0 ? Math.ceil(Math.log10(hi)) : 0
  const ticks = [0, ...d3.range(0, maxExp + 1).map((e) => 10 ** e)].filter((t) => t >= lo && t <= hi)
  return ticks.length >= 2 ? ticks : [lo, hi]
}

/** Pure. Returns null when no series has data. */
export function createEcdfLayout(series: EcdfSeries[], scale: BinScale): EcdfLayout | null {
  const withData = series.filter((s) => s.ecdf.total > 0)
  if (withData.length === 0) {
    return null
  }
  let min = d3.min(withData, (s) => s.ecdf.steps[0].value) as number
  let max = d3.max(withData, (s) => s.ecdf.steps[s.ecdf.steps.length - 1].value) as number
  if (min === max) {
    // Pad so that a single distinct value draws as one vertical step mid-axis.
    min = Math.max(0, min - 1)
    max = max + 1
  }

  const x: d3.ScaleContinuousNumeric<number, number> = scale === 'log'
    ? d3.scaleSymlog().constant(LOG_OFFSET).domain([min, max]).range([0, innerWidth])
    : d3.scaleLinear().domain([min, max]).range([0, innerWidth]).nice()
  const domain = x.domain() as [number, number]

  return {
    x,
    y: d3.scaleLinear().domain([0, 1]).range([innerHeight, 0]),
    domain,
    xTicks: scale === 'log' ? logTickValues(domain) : null,
    innerWidth,
    innerHeight,
  }
}

export function renderEcdfChart(
  container: SVGGElement,
  series: EcdfSeries[],
  layout: EcdfLayout,
  labels: { x: string; y: string },
): ChartFrame {
  // `container` is a <g> owned by D3 inside the React <svg>. The frame applies the margins.
  const frame = createChartFrame(container)
  const { x, y, domain, xTicks } = layout

  const xAxis = d3.axisBottom<number>(x).tickFormat(d3.format(','))
  drawXAxis(frame, xTicks ? xAxis.tickValues(xTicks) : xAxis, labels.x)
  drawYAxis(frame, d3.axisLeft<number>(y).ticks(10).tickFormat(d3.format('.0%')), labels.y)

  // Horizontal reference lines at 50% and 90%, labelled at the right edge.
  const refs = frame.root.append('g').attr('class', 'ecdf-refs')
  REFERENCE_QUANTILES.forEach(({ p, label }) => {
    refs.append('line').attr('class', 'ecdf-ref')
      .attr('x1', 0).attr('x2', layout.innerWidth).attr('y1', y(p)).attr('y2', y(p))
      .attr('stroke', '#57606a').attr('stroke-dasharray', '2 3')
    refs.append('text').attr('class', 'ecdf-ref-label')
      .attr('x', layout.innerWidth).attr('y', y(p) - 4)
      .attr('text-anchor', 'end').style('font-size', '0.75rem').attr('fill', '#57606a')
      .text(`${label} (${Math.round(p * 100)}%)`)
  })

  const line = d3.line<[number, number]>()
    .x(([v]) => x(v))
    .y(([, f]) => y(f))
    .curve(d3.curveStepAfter)

  series.filter((s) => s.ecdf.total > 0).forEach((s) => {
    const g = frame.root.append('g').attr('class', 'ecdf-series').attr('data-series', s.key)
    const points: [number, number][] = [
      [domain[0], 0],
      ...s.ecdf.steps.map((step): [number, number] => [step.value, step.fraction]),
      [domain[1], 1],
    ]
    g.append('path').attr('class', 'ecdf-line').attr('d', line(points))
      .attr('fill', 'none').attr('stroke', s.color).attr('stroke-width', 2)
      .attr('stroke-dasharray', s.dash ?? null)
    g.selectAll('circle.ecdf-step').data(s.ecdf.steps).join('circle')
      .attr('class', 'ecdf-step')
      .attr('data-value', (d) => d.value)
      .attr('cx', (d) => x(d.value)).attr('cy', (d) => y(d.fraction)).attr('r', 2.5)
      .attr('fill', s.color)
    // Drop lines from the median and p90 crossings down to the x axis.
    ;([['median', 0.5, s.median], ['p90', 0.9, s.p90]] as const).forEach(([name, p, q]) => {
      if (q === null) return
      g.append('line').attr('class', 'ecdf-quantile').attr('data-quantile', name)
        .attr('x1', x(q)).attr('x2', x(q)).attr('y1', y(p)).attr('y2', layout.innerHeight)
        .attr('stroke', s.color).attr('stroke-dasharray', '1 3')
    })
  })

  return frame
}
```

Notes:
- **Step path.** `curveStepAfter` over `(domainStart, 0), (v1, F1), …, (vn, 1), (domainEnd, 1)` holds each fraction until the next value and then jumps up. That is the right-continuous ECDF. It draws exactly one riser per distinct value (Requirement 1.2). When there is a single distinct value it draws one vertical riser (Requirement 3.2).
- **Log scale.** `scaleSymlog().constant(1)` maps v to `sign(v)·ln(1 + |v|)`. For v ≥ 0 that is proportional to `log10(v + LOG_OFFSET)`, the transform the histograms use (006). Zero sits at the left edge and nothing is `NaN` (Requirement 2.3). Symlog's default ticks are linear, so log mode passes explicit decade ticks.
- **No zero-size frame.** The renderer only runs when `createEcdfLayout` returned a layout. The component never mounts the SVG for empty data, so no empty axis is drawn (Requirement 3.1).

### 5. `components/ChartTooltip.tsx`, `ChartEmptyState.tsx`, `ChartCoverageNote.tsx`, `ScaleToggle.tsx`

```tsx
// ChartTooltip.tsx
interface ChartTooltipProps {
  id: string
  open: boolean
  /** The anchor position as a percentage of the chart container (0–100). */
  leftPct: number
  topPct: number
  children: ReactNode
}

const ChartTooltip: React.FC<ChartTooltipProps> = ({ id, open, leftPct, topPct, children }) => {
  if (!open) return null
  return (
    <Paper
      id={id}
      role="tooltip"
      aria-live="polite"
      elevation={3}
      sx={{
        position: 'absolute',
        left: `${leftPct}%`,
        top: `${topPct}%`,
        // Flip to the left of the anchor on the right side of the chart so the tooltip stays inside.
        transform: leftPct > 60 ? 'translate(calc(-100% - 12px), -50%)' : 'translate(12px, -50%)',
        pointerEvents: 'none',
        px: 1.5,
        py: 1,
        typography: 'body2',
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </Paper>
  )
}
```

```tsx
// ChartEmptyState.tsx
const ChartEmptyState: React.FC<{ message?: string }> = ({
  message = 'No commits to display for this repository.',
}) => <Alert severity="info" role="status" sx={{ my: 4 }}>{message}</Alert>

// ChartCoverageNote.tsx
interface ChartCoverageNoteProps { hasNextPage: boolean; count: number; subject?: string }
const ChartCoverageNote: React.FC<ChartCoverageNoteProps> = ({ hasNextPage, count, subject = 'chart' }) =>
  hasNextPage ? (
    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
      This {subject} covers the latest {count} commits only.
    </Typography>
  ) : null
```

`ScaleToggle` is the `FormLabel` + `ToggleButtonGroup` block from 006's `HistogramControls`, moved as is (`useId` label, `exclusive`, `size="small"`, Linear/Log buttons, the `value && onChange(value)` guard). Its props are `{ value: BinScale; onChange: (s: BinScale) => void }`.

### 6. `components/EcdfCommitSize.tsx`: the graph component

Configuration (module constants, so the memo and effect dependencies stay stable):

```ts
export type EcdfMetric = 'addsDeletes' | 'additions' | 'deletions' | 'changedFiles'

type SeriesConfig = Pick<EcdfSeries, 'key' | 'label' | 'color' | 'dash'> & { unit: string }

// Each color has at least 3:1 contrast against white (WCAG AA for graphics).
// #00838f replaces the histogram's #00bcd4, which is about 2.3:1.
const SERIES: Record<SeriesConfig['key'], SeriesConfig> = {
  additions: { key: 'additions', label: 'Additions', color: '#2da44e', unit: 'lines' },
  deletions: { key: 'deletions', label: 'Deletions', color: '#cf222e', dash: '6 4', unit: 'lines' },
  changedFiles: { key: 'changedFiles', label: 'Changed files', color: '#00838f', unit: 'files' },
}

const METRICS: Record<EcdfMetric, { label: string; xLabel: string; series: SeriesConfig[] }> = {
  addsDeletes: { label: 'Adds + Deletes', xLabel: 'Lines changed per commit', series: [SERIES.additions, SERIES.deletions] },
  additions: { label: 'Additions', xLabel: 'Lines added per commit', series: [SERIES.additions] },
  deletions: { label: 'Deletions', xLabel: 'Lines deleted per commit', series: [SERIES.deletions] },
  changedFiles: { label: 'Changed files', xLabel: 'Files changed per commit', series: [SERIES.changedFiles] },
}

const Y_LABEL = 'Share of commits at or below x'
const formatPct = d3.format('.1%')
const formatNum = d3.format(',')
```

Component outline:

```tsx
const EcdfCommitSize: React.FC<RepoGraphProps> = ({ commits, hasNextPage, status }) => {
  const [metric, setMetric] = useState<EcdfMetric>('addsDeletes')
  const [scale, setScale] = useState<BinScale>('linear')
  const [cursor, setCursor] = useState<number | null>(null)
  const plotRef = useRef<SVGGElement>(null)
  const tooltipId = useId()
  const metricLabelId = useId()

  const { xLabel, series: configs } = METRICS[metric]
  const unit = configs[0].unit

  const series = useMemo<EcdfSeries[]>(() => configs.map((cfg) => {
    const ecdf = computeEcdf(commits.map((c) => c[cfg.key]))
    return { ...cfg, ecdf, median: ecdfQuantile(ecdf, 0.5), p90: ecdfQuantile(ecdf, 0.9) }
  }), [commits, configs])

  const layout = useMemo(() => createEcdfLayout(series, scale), [series, scale])
  const stops = useMemo(() => ecdfStops(series.map((s) => s.ecdf)), [series])

  useEffect(() => {
    if (plotRef.current && layout) {
      renderEcdfChart(plotRef.current, series, layout, { x: xLabel, y: Y_LABEL })
    }
  }, [series, layout, xLabel])

  if (status === Status.Pending) return <CircularProgress sx={{ display: 'block', mx: 'auto', my: 8 }} />
  if (!layout) return <ChartEmptyState />
  // ... handlers and JSX below
}
```

All hooks run before the early returns. When `commits` goes from `[]` to rows, `layout` changes. The effect then runs after the `<svg>` mounts, so `plotRef.current` is set.

**Controls row.** It renders above the chart: a `FormLabel` "Metric" with a `ToggleButtonGroup` (`exclusive`, `aria-labelledby={metricLabelId}`, one `ToggleButton` per `METRICS` entry, using the same null guard), followed by `<ScaleToggle value={scale} onChange={...} />`. Both change handlers also call `setCursor(null)`.

**Legend and quantile summary.** This is HTML, under the controls. For each series it shows a 24×0 inline SVG line swatch with the series' `stroke` and `stroke-dasharray`, the label, and the text `median {formatNum(median)} · 90th pct {formatNum(p90)} {unit}`. The legend and the dash pattern mean color is never the only cue (usability NFR). The text also exposes the reference-line values to assistive tech.

**Coverage note.** `<ChartCoverageNote hasNextPage={hasNextPage} count={commits.length} />` (Requirement 3.4).

**Chart.** It sits in a `Box sx={{ position: 'relative', overflowX: 'auto' }}`:

```tsx
<svg
  viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
  style={{ display: 'block', width: '100%', minWidth: 700, height: 'auto' }}
  role="img"
  aria-label={`Cumulative distribution of ${METRICS[metric].label.toLowerCase()} per commit. Use the left and right arrow keys to read values.`}
  aria-describedby={cursor !== null ? tooltipId : undefined}
  tabIndex={0}
  onPointerMove={handlePointerMove}
  onPointerLeave={() => setCursor(null)}
  onFocus={() => setCursor(series[0].median ?? stops[0])}
  onBlur={() => setCursor(null)}
  onKeyDown={handleKeyDown}
>
  <g ref={plotRef} />
  {cursor !== null && (
    <line
      className="ecdf-cursor"
      x1={CHART_MARGINS.left + layout.x(cursor)} x2={CHART_MARGINS.left + layout.x(cursor)}
      y1={CHART_MARGINS.top} y2={CHART_MARGINS.top + layout.innerHeight}
      stroke="#24292f" strokeWidth={1} pointerEvents="none"
    />
  )}
</svg>
<ChartTooltip
  id={tooltipId}
  open={cursor !== null}
  leftPct={((CHART_MARGINS.left + (cursor === null ? 0 : layout.x(cursor))) / CHART_WIDTH) * 100}
  topPct={((CHART_MARGINS.top + layout.y(0.5)) / CHART_HEIGHT) * 100}
>
  <strong>{cursor !== null && `≤ ${formatNum(cursor)} ${unit}`}</strong>
  {cursor !== null && series.map((s) => (
    <div key={s.key}>{s.label}: {formatPct(ecdfAt(s.ecdf, cursor))} of commits</div>
  ))}
</ChartTooltip>
```

`height: 'auto'` with a viewBox keeps the aspect ratio uniform, with no letterboxing. That makes the CSS-pixel to viewBox mapping a single ratio, and lets the tooltip be positioned in percentages without measuring.

**Handlers:**

```ts
const clamp = (v: number) => Math.min(layout.domain[1], Math.max(layout.domain[0], v))

const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
  const rect = e.currentTarget.getBoundingClientRect()
  if (rect.width === 0) return
  const px = ((e.clientX - rect.left) / rect.width) * CHART_WIDTH - CHART_MARGINS.left
  setCursor(clamp(Math.round(layout.x.invert(px))))
}

const handleKeyDown = (e: React.KeyboardEvent<SVGSVGElement>) => {
  if (stops.length === 0) return
  const last = stops[stops.length - 1]
  let next: number | null | undefined
  switch (e.key) {
    case 'ArrowRight': next = cursor === null ? stops[0] : stops[d3.bisectRight(stops, cursor)] ?? last; break
    case 'ArrowLeft': next = cursor === null ? stops[0] : stops[d3.bisectLeft(stops, cursor) - 1] ?? stops[0]; break
    case 'Home': next = stops[0]; break
    case 'End': next = last; break
    case 'Escape': next = null; break
    default: return
  }
  e.preventDefault()
  setCursor(next ?? null)
}
```

On hover, the cursor shows any integer x, so the user can read "share of commits ≤ 100 lines" exactly (Requirement 2.1). On the keyboard, it steps between the real step positions. The tooltip text is computed with `ecdfAt` from the stored rows. Nothing is refetched or re-derived from bins.

### 7. `AppRouter.tsx` and `GraphList.tsx`

```tsx
import EcdfCommitSize from './EcdfCommitSize'
// ...
const CommitSize = GraphPage(RepoCommits, EcdfCommitSize)
// ...
<Route
  path="/graphs/repo-commit-size"
  element={
    <PrivateRoute path="/graphs/repo-commit-size" pathname={pathname} search={search}>
      <CommitSize />
    </PrivateRoute>
  }
/>
```

In `GraphList.tsx`, the third `ImageListItem` becomes `<CustomCard to="/graphs/repo-commit-size" title="Commit Size Distribution" description="Share of commits at or below each size" />`.

---

## Key Technical Decisions

- **Type-1 (inverse-ECDF) quantiles, not `d3.quantile`**: `d3.quantile` interpolates (R type 7) and can return a value that no commit has, which would not sit on a step of the drawn line. The inverse ECDF returns the observed value where the step crosses p, so the reference markers fall exactly on the line. The `1e-9` epsilon keeps `p * total` float error from skipping a step.
- **Steps keep `cumulativeCount` as an integer**: Quantile comparisons are done on integers (`cumulativeCount >= p * total`), not on float fractions. The last fraction is `total / total`, which is exactly `1` (Requirement 1.1).
- **Symlog with `constant(LOG_OFFSET)` for the log axis**: It is mathematically the same spacing as the histograms' `log10(v + 1)` (shared `LOG_OFFSET`), and it handles zeros natively (Requirement 2.3). Explicit decade ticks `0, 1, 10, 100, …` replace symlog's linear default ticks.
- **Metric is a 4-way exclusive toggle, with "Adds + Deletes" as the default**: This covers Requirement 1.3 (pick additions, deletions or changed files) and 1.4 (both line metrics on one shared x axis) without a multi-select. Changed files is never drawn on the line axis, because its units differ.
- **Legend and dash pattern instead of direct end-of-line labels**: Every ECDF line ends at (max, 1), so labels at the line ends would collide. An HTML legend, with a dashed Deletions line and quantile values in text, meets the "not color alone" NFR.
- **The SVG is the single focus target, with arrow-key navigation**: With one tab stop per step, a 100-commit chart would need up to 200 tab stops. A single focusable `svg` (`tabIndex=0`), arrow keys moving between distinct values, and `aria-describedby` pointing to a live tooltip keeps keyboard access usable.
- **Tooltip is positioned by percentage over a uniformly scaled SVG**: This avoids `getScreenCTM`/`d3.pointer`, which jsdom does not implement. It also avoids layout measurement, so tooltip behavior can be tested.
- **Scaffolding is extracted now, not in 008**: The NFR forbids duplicating margins and axes. `bargraph.ts` is the only existing source of them, so 007 moves them into `chartScaffold.ts` and refactors the bar chart onto it. 008–011 then import the same module, along with `ChartTooltip`, `ChartEmptyState` and `ChartCoverageNote`.
- **Changed-files color `#00838f`**: The histogram's `#00bcd4` fails the 3:1 contrast for graphical objects against white. The histogram is out of scope and keeps its color.

---

## Tests to Add

Follow the existing convention: the `it()` description is `MethodName_Condition_ExpectedOutcome`, grouped by `describe` (see `src/frontend/components/__tests__/PlaceholderChart.test.tsx`).

### `src/frontend/utils/__tests__/ecdf.test.ts`

#### Test 1: `computeEcdf_UnsortedValues_ReturnsAscendingSteps`
- **Setup**: `computeEcdf([5, 1, 3, 10])`.
- **Assert**: `steps.map((s) => s.value)` equals `[1, 3, 5, 10]`, and `total` is 4.

#### Test 2: `computeEcdf_AnyInput_LastFractionIsExactlyOne`
- **Setup**: `computeEcdf([7, 2, 2, 9, 4, 4, 4])`.
- **Assert**: The last step's `fraction` is `1` (`toBe(1)`), and the fractions do not decrease.

#### Test 3: `computeEcdf_DuplicateValues_CollapseToOneStep`
- **Setup**: `computeEcdf([5, 1, 3, 3, 10])`.
- **Assert**: There are 4 steps. The step for 3 is `{ value: 3, count: 2, cumulativeCount: 3, fraction: 0.6 }`.

#### Test 4: `computeEcdf_SingleValue_ReturnsOneStepAtOne`
- **Setup**: `computeEcdf([42])`.
- **Assert**: The steps equal `[{ value: 42, count: 1, cumulativeCount: 1, fraction: 1 }]`.

#### Test 5: `computeEcdf_EmptyInput_ReturnsNoSteps`
- **Setup**: `computeEcdf([])`.
- **Assert**: The result equals `{ steps: [], total: 0 }`.

#### Test 6: `computeEcdf_NullAndNonNumericValues_ExcludesThemWithoutThrowing`
- **Setup**: `computeEcdf([3, null, NaN, '7', undefined, Infinity, 1])`.
- **Assert**: The values are `[1, 3]`, `total` is 2, and nothing throws.

#### Test 7: `computeEcdf_InputArray_IsNotMutated`
- **Setup**: `const input = [3, 1, 2]`, then `computeEcdf(input)`.
- **Assert**: `input` still equals `[3, 1, 2]`.

#### Test 8: `ecdfAt_VariousX_ReturnsShareAtOrBelow`
- **Setup**: `const e = computeEcdf([5, 1, 3, 3, 10])`.
- **Assert**: `ecdfAt(e, 0)` is 0, `ecdfAt(e, 3)` is 0.6, `ecdfAt(e, 4)` is 0.6, `ecdfAt(e, 10)` is 1, `ecdfAt(e, 100)` is 1, and `ecdfAt(computeEcdf([]), 5)` is 0.

#### Test 9: `ecdfQuantile_MedianAndP90_ReturnsObservedStepValues`
- **Setup**: `const e = computeEcdf([5, 1, 3, 3, 10])`.
- **Assert**: `ecdfQuantile(e, 0.5)` is 3 and `ecdfQuantile(e, 0.9)` is 10.

#### Test 10: `ecdfQuantile_ExactBoundary_ReturnsValueReachingTarget`
- **Setup**: `computeEcdf(d3.range(1, 11))` (1..10).
- **Assert**: p 0.5 gives 5 and p 0.9 gives 9. These are exact boundaries and must not jump to the next value.

#### Test 11: `ecdfQuantile_EmptyOrOutOfRange_ReturnsNull`
- **Assert**: `ecdfQuantile(computeEcdf([]), 0.5)` is null. `ecdfQuantile(e, 0)` and `ecdfQuantile(e, 1.5)` are null.

#### Test 12: `ecdfStops_TwoEcdfs_ReturnsSortedDistinctUnion`
- **Setup**: `ecdfStops([computeEcdf([10, 20, 20]), computeEcdf([5, 20, 40])])`.
- **Assert**: The result equals `[5, 10, 20, 40]`.

### `src/frontend/services/__tests__/ecdfChart.test.ts`

Use a helper `seriesOf(values)` that returns an `EcdfSeries` with `computeEcdf(values)` and its median and p90.

#### Test 1: `createEcdfLayout_NoData_ReturnsNull`
- **Setup**: `createEcdfLayout([seriesOf([])], 'linear')`.
- **Assert**: The result is `null`.

#### Test 2: `createEcdfLayout_TwoSeries_UsesCombinedExtent`
- **Setup**: `createEcdfLayout([seriesOf([10, 20, 300]), seriesOf([0, 5, 40])], 'linear')`.
- **Assert**: `domain[0]` ≤ 0 and `domain[1]` ≥ 300. `xTicks` is null.

#### Test 3: `createEcdfLayout_AllValuesEqual_PadsDomainAroundValue`
- **Setup**: `createEcdfLayout([seriesOf([7, 7, 7])], 'linear')`.
- **Assert**: The domain contains `[6, 8]`, and `x(7)` lies strictly between `x(domain[0])` and `x(domain[1])`.

#### Test 4: `createEcdfLayout_LogScaleWithZeros_MapsZeroToLeftEdgeWithoutNaN`
- **Setup**: `createEcdfLayout([seriesOf([0, 1, 10, 300])], 'log')`.
- **Assert**: `x(0)` is 0, `x(300)` is `innerWidth`, `x(10)` is finite, and `xTicks` equals `[0, 1, 10, 100]`.

#### Test 5: `logTickValues_NarrowDomain_FallsBackToDomainEnds`
- **Setup**: `logTickValues([2, 5])`.
- **Assert**: The result equals `[2, 5]`.

### `src/frontend/components/__tests__/EcdfCommitSize.test.tsx`

Render `<EcdfCommitSize commits={rows} hasNextPage={false} status={Status.Success} />` directly with `@testing-library/react`. The fixture `rows` holds 4 `CommitRow`s: additions `[10, 20, 20, 300]`, deletions `[5, 5, 40, 0]`, changedFiles `[1, 2, 3, 4]`. Count steps with `container.querySelectorAll('[data-series="additions"] circle.ecdf-step')`.

#### Test 1: `EcdfCommitSize_AddsDeletesDefault_RendersOneStepPerDistinctValuePerSeries`
- **Assert**: Additions has 3 steps (10, 20, 300) and deletions has 3 steps (0, 5, 40). There are 2 `path.ecdf-line` elements. The `Adds + Deletes` button has `aria-pressed="true"`. The x-axis label "Lines changed per commit" and the y-axis label are present.

#### Test 2: `EcdfCommitSize_MetricChangedFiles_RedrawsSingleSeries`
- **Setup**: `await user.click(screen.getByRole('button', { name: 'Changed files' }))`.
- **Assert**: There are 4 `circle.ecdf-step` elements, all under `[data-series="changedFiles"]`. There is no `[data-series="additions"]`. The label "Files changed per commit" is shown.

#### Test 3: `EcdfCommitSize_Rendered_ShowsLabelledReferenceLinesAndQuantileSummary`
- **Assert**: There are 2 `line.ecdf-ref` elements. The texts "Median (50%)" and "90th percentile (90%)" are present. The legend contains `median 20 · 90th pct 300 lines` for Additions. There are 4 `line.ecdf-quantile` elements (2 per series).

#### Test 4: `EcdfCommitSize_KeyboardFocus_ShowsTooltipAndArrowMovesCursor`
- **Setup**: `screen.getByRole('img', { name: /cumulative distribution/i }).focus()`, then `await user.keyboard('{ArrowRight}')`.
- **Assert**: After focus, `getByRole('tooltip')` contains `≤ 20 lines`, `Additions: 75.0%` and `Deletions: 75.0%`. After ArrowRight it contains `≤ 40 lines` and `Deletions: 100.0%`. The svg's `aria-describedby` equals the tooltip's `id`. After `{Escape}`, `queryByRole('tooltip')` is null.

#### Test 5: `EcdfCommitSize_LogScaleToggled_RedrawsWithDecadeTicks`
- **Setup**: `await user.click(screen.getByRole('button', { name: 'Log' }))`.
- **Assert**: The `.axis--x .tick text` contents include `'1'`, `'10'` and `'100'`. Before the toggle, they did not include `'1'`. The step count is unchanged (3 + 3).

#### Test 6: `EcdfCommitSize_NoCommits_ShowsEmptyStateWithoutAxes`
- **Setup**: `commits={[]}`.
- **Assert**: `getByRole('status')` has the text `/no commits to display/i`. `container.querySelector('.axis')` is null, and there is no `role="img"` chart.

#### Test 7: `EcdfCommitSize_AllValuesEqual_RendersSingleStep`
- **Setup**: 3 rows with additions `7`, deletions `7`, metric `Additions` (click).
- **Assert**: There is exactly 1 `circle.ecdf-step`, and the path `d` attribute contains no `NaN`.

#### Test 8: `EcdfCommitSize_SingleCommit_RendersWithoutError`
- **Setup**: `commits={[rows[0]]}`.
- **Assert**: It renders without throwing, with 1 step per series and a tooltip on focus showing `100.0%`.

#### Test 9: `EcdfCommitSize_HasNextPage_ShowsLatestNCommitsNote`
- **Setup**: `hasNextPage={true}`.
- **Assert**: `getByText('This chart covers the latest 4 commits only.')` is present. With `hasNextPage={false}` the note is absent.

#### Test 10: `EcdfCommitSize_Pending_ShowsSpinner`
- **Setup**: `status={Status.Pending}`, `commits={[]}`.
- **Assert**: `getByRole('progressbar')` is present and there is no `role="status"` empty state.

#### Test 11: `RepoCommits_EcdfRoute_FetchesAndRendersSteps`
- **Setup**: Use an MSW handler `http.post(/\/api\/repo\//)` that returns `{ commits: rows, hasNextPage: true }` (same pattern as `RepoCommits.test.tsx`), then `renderWithStores(<RepoCommits graphComponent={EcdfCommitSize} />, { userInitialState: { token: 'AbcDeF123456' } })`.
- **Assert**: `await findByText(/latest 4 commits/i)` resolves, and there are 6 `circle.ecdf-step`.

#### Test 12: `computeEcdf_HundredCommits_CompletesUnder50ms`
- **Setup**: 100 rows with random integer metrics. Time `computeEcdf` + `createEcdfLayout` + a full `render(<EcdfCommitSize .../>)` with `performance.now()`.
- **Assert**: The elapsed time is under 50 ms. Use a generous single-shot check. Skip with `it.skipIf(process.env.CI)` if it turns out to be flaky.

### Regression

`RepoCommits.test.tsx` from 006 must still pass unchanged after the `bargraph.ts` refactor. It asserts rect counts and the first `.axis--x .tick text`, which this plan keeps. The 006 `HistogramControls` scale-toggle test covers `ScaleToggle`.

---

## Verification

```bash
# 1. Build passes
yarn build

# 2. Frontend type check (strict, noUnusedLocals)
yarn tsc -p src/tsconfig.frontend.json --noEmit

# 3. Relevant test files pass
yarn test src/frontend/utils/__tests__/ecdf.test.ts src/frontend/services/__tests__/ecdfChart.test.ts src/frontend/components/__tests__/EcdfCommitSize.test.tsx src/frontend/features/repo/__tests__/RepoCommits.test.tsx

# 4. Full suite and lint
yarn test
yarn lint
```

Manual check with `yarn dev` at `https://localhost:3000`:
1. Log in and open `/graphs/repo-commit-size` for `facebook/react`. Green solid and red dashed step lines should share one x axis. The legend should show each series' median and p90. Horizontal "Median (50%)" and "90th percentile (90%)" lines and dotted drop lines should be visible. The note "latest 100 commits only" should appear.
2. Hover across the chart. The cursor and tooltip should follow, and read for example `≤ 100 lines · Additions: 78.0%`.
3. Press Tab to focus the chart, then use ←/→/Home/End to step through values. Escape hides the tooltip.
4. Switch the metric to Changed files and toggle Log. The chart should redraw immediately with decade ticks, a zero at the left edge, and no new request in the Network tab.
5. Load a repository with no commits, or an invalid one. The empty state or error alert should appear, with no empty axes.
6. Revisit `/graphs/repo-additions-deletions`. The histogram should look identical to before the scaffolding refactor.
