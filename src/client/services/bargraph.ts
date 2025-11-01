import * as d3 from 'd3'
import { get } from './object'
import { BarGraphData, BarGraphDataSetProperties, BarGraphStyle, DataItem } from '../types/graph.types'

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
    setProperties: BarGraphDataSetProperties): void => {

  const { colors, height, setCount, xScale, yScale,  } =
    setProperties

  node
    .selectAll('bar')
    .data(set)
    .enter()
    .append('rect')
    .style('fill', colors[setIndex])
    .style('stroke-width', 1)
    .style('stroke', '#000')
    .attr(
      'x',
      (d: DataItem) =>
        (xScale[setIndex](get(d, xAxis)) ?? 0) +
        (setIndex !== 0 ? xScale[setIndex].bandwidth() / 2 : 0),
    )
    .attr(
      'width',
      setCount > 1
        ? xScale[setIndex].bandwidth() / 2
        : xScale[setIndex].bandwidth(),
    )
    .attr('y', (d: DataItem) => yScale(get(d, yAxis)))
    .attr('height', (d: DataItem) => height - yScale(get(d, yAxis)))
}

export const renderBarGraph = (svgElement: SVGSVGElement, data: BarGraphData, style: BarGraphStyle): void => {
  if (data.sets.every((set) => !set.length)) {
    d3.select(svgElement).selectAll('*').remove()
  } else {
    const innerNode = d3.select(svgElement).append('g')

    innerNode.attr('transform', `translate(${margins.top}, ${margins.left})`)

    const xAxisPadding = data.sets.length > 1 ? 0.2 : 0.4
    const height = style.height - margins.top - margins.bottom
    const width = style.width - margins.right - margins.left

    const xScale = data.sets.map((set) => {
      const domain = set.map((d) => get(d, xAxis))
      return d3
        .scaleBand()
        .domain(domain)
        .rangeRound([0, style.width])
        .padding(xAxisPadding)
    })

    const yMax = Math.max(
      ...data.sets.map((set) => 
        d3.max(set, (d) => get(d, yAxis)) ?? 0
      ),
    )

    const yTrueMax = yMax % 10 === 0 ? yMax : yMax + (10 - (yMax % 10))

    const yScale = d3
      .scaleLinear()
      .domain([0, yTrueMax])
      .rangeRound([height, 0])

    innerNode
      .append('g')
      .attr('class', 'axis axis--x')
      .attr('transform', `translate(0, ${height})`)
      .call(d3.axisBottom(xScale[0]))

    innerNode
      .append('text')
      .attr('transform', `translate(${width / 2},${height + xLabelMargin})`)
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
      .attr('x', 0 - height / 2)
      .attr('y', 0 - yLabelMargin)
      .attr('dy', '1em')
      .style('text-anchor', 'middle')
      .style('font-size', '0.813rem')
      .text(style.yAxisLabel)

    const dataSetProperties: BarGraphDataSetProperties = {
      height,
      setCount: data.sets.length,
      colors: style.colors,
      xScale,
      yScale,
    }

    data.sets.forEach((set, setIndex) => renderBarGraphSet(innerNode, set, setIndex, dataSetProperties))
  }
}
