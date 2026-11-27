import * as d3 from 'd3'
import { get } from './object'
import { BarGraphDataSets, BarGraphStyle, DataItem } from '../types/graph.types'
import {
  clearChart,
  createChartFrame,
  drawXAxis,
  drawYAxis,
} from './chartScaffold'

const xAxis = 'label'
const yAxis = 'count'

const MAX_X_TICK_LABELS = 20

const renderBarGraphSet = (
  node: d3.Selection<SVGGElement, unknown, null, undefined>,
  set: DataItem[],
  setIndex: number,
  setColor: string,
  setCount: number,
  setXScale: d3.ScaleBand<string>,
  yScale: d3.ScaleLinear<number, number, never>,
  graphHeight: number): void => {
  node
    .selectAll('bar')
    .data(set)
    .enter()
    .append('rect')
    .style('fill', setColor)
    .style('stroke-width', 1)
    .style('stroke', '#000')
    .attr(
      'x',
      (d: DataItem) =>
        (setXScale(get(d, xAxis)) ?? 0) +
        (setIndex !== 0 ? setXScale.bandwidth() / 2 : 0),
    )
    .attr(
      'width',
      setCount > 1
        ? setXScale.bandwidth() / 2
        : setXScale.bandwidth(),
    )
    .attr('y', (d: DataItem) => yScale(get(d, yAxis)))
    .attr('height', (d: DataItem) => graphHeight - yScale(get(d, yAxis)))
}

export const renderBarGraph = (svgElement: SVGSVGElement, sets: BarGraphDataSets, style: BarGraphStyle): void => {
  clearChart(svgElement)

  if (sets.every((set) => !set.length)) {
    return
  }

  const { colors, height, width } = style
  const frame = createChartFrame(svgElement, { width, height })
  const { root: innerNode, innerHeight: graphHeight } = frame

  const xAxisPadding = sets.length > 1 ? 0.2 : 0.4

  const xScale = sets.map((set) => {
    const domain = set.map((d) => get(d, xAxis))
    return d3
      .scaleBand()
      .domain(domain)
      .rangeRound([0, width])
      .padding(xAxisPadding)
  })

  const yMax = Math.max(
    ...sets.map((set) =>
      d3.max(set, (d) => get(d, yAxis)) ?? 0,
    ),
  )

  const yTrueMax = yMax % 10 === 0 ? yMax : yMax + (10 - (yMax % 10))

  const yScale = d3
    .scaleLinear()
    .domain([0, yTrueMax])
    .rangeRound([graphHeight, 0])

  const xDomain = xScale[0].domain()
  const tickStep = Math.ceil(xDomain.length / MAX_X_TICK_LABELS)

  drawXAxis(frame, d3.axisBottom(xScale[0]).tickValues(xDomain.filter((_, i) => i % tickStep === 0)), style.xAxisLabel)
  drawYAxis(frame, d3.axisLeft(yScale).ticks(9), style.yAxisLabel)

  const { length: setCount } = sets

  sets.forEach((set, setIndex) => {
    const { [setIndex]: setColor } = colors
    const { [setIndex]: setXScale } = xScale

    renderBarGraphSet(innerNode, set, setIndex, setColor, setCount, setXScale, yScale, graphHeight)
  })
}
