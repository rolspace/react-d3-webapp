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
  const [{ weekStart: last }] = weeks.slice(-1)

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
