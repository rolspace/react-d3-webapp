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
