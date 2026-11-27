import * as d3 from 'd3'
import { BinScale, LOG_OFFSET } from '../utils/binning'
import { Ecdf } from '../utils/ecdf'
import { CHART_HEIGHT, CHART_MARGINS, CHART_WIDTH, ChartFrame, createChartFrame, drawXAxis, drawYAxis } from './chartScaffold'

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
      if (q === null) {
        return
      }
      g.append('line').attr('class', 'ecdf-quantile').attr('data-quantile', name)
        .attr('x1', x(q)).attr('x2', x(q)).attr('y1', y(p)).attr('y2', layout.innerHeight)
        .attr('stroke', s.color).attr('stroke-dasharray', '1 3')
    })
  })

  return frame
}
