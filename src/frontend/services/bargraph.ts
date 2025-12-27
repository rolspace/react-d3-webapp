import * as d3 from 'd3'
import { get } from './object'
import { BarGraphDataSets, BarGraphStyle, DataItem } from '../types/graph.types'

interface Margins {
  top: number
  right: number
  bottom: number
  left: number
}

const margins: Margins = { top: 40, right: 40, bottom: 40, left: 40 }
const xLabelMargin = 35
const yLabelMargin = 50

const xAxis = 'label'
const yAxis = 'count'

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
  if (sets.every((set) => !set.length)) {
    d3.select(svgElement).selectAll('*').remove()
  } else {
    const { colors, height, width } = style
    const innerNode = d3.select(svgElement).append('g')

    innerNode.attr('transform', `translate(${margins.top}, ${margins.left})`)

    const xAxisPadding = sets.length > 1 ? 0.2 : 0.4
    const graphHeight = height - margins.top - margins.bottom
    const graphWidth = width - margins.right - margins.left

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

    innerNode
      .append('g')
      .attr('class', 'axis axis--x')
      .attr('transform', `translate(0, ${graphHeight})`)
      .call(d3.axisBottom(xScale[0]))

    innerNode
      .append('text')
      .attr('transform', `translate(${graphWidth / 2}, ${graphHeight + xLabelMargin})`)
      .style('text-anchor', 'middle')
      .style('font-size', '0.813rem')
      .text(style.xAxisLabel)

    innerNode
      .append('g')
      .attr('class', 'axis axis--y')
      .call(d3.axisLeft(yScale).ticks(9))

    innerNode
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', 0 - graphHeight / 2)
      .attr('y', 0 - yLabelMargin)
      .attr('dy', '1em')
      .style('text-anchor', 'middle')
      .style('font-size', '0.813rem')
      .text(style.yAxisLabel)

    const { length: setCount } = sets

    sets.forEach((set, setIndex) => {
      const { [setIndex]: setColor } = colors
      const { [setIndex]: setXScale } = xScale

      renderBarGraphSet(innerNode, set, setIndex, setColor, setCount, setXScale, yScale, graphHeight)
    })
  }
}
