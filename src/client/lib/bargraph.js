import * as d3 from 'd3'
import _ from 'lodash'

const margins = { top: 40, right: 40, bottom: 40, left: 40 }
const xLabelMargin = 35
const yLabelMargin = 50

const renderBarGraphSet = (graphInfo, set, index) => {
  const { height, innerNode, xScales, yScale, xAxis, yAxis, setCount, colors } =
    graphInfo

  innerNode
    .selectAll('bar')
    .data(set)
    .enter()
    .append('rect')
    .style('fill', colors[index])
    .style('stroke-width', 1)
    .style('stroke', '#000')
    .attr(
      'x',
      (d) =>
        xScales[index](_.get(d, xAxis)) +
        (index !== 0 ? xScales[index].bandwidth() / 2 : 0),
    )
    .attr(
      'width',
      setCount > 1
        ? xScales[index].bandwidth() / 2
        : xScales[index].bandwidth(),
    )
    .attr('y', (d) => yScale(_.get(d, yAxis)))
    .attr('height', (d) => height - yScale(_.get(d, yAxis)))
}

export const renderBarGraph = (node, data) => {
  if (data.sets.every((set) => !set.length)) {
    d3.select(node).selectAll('*').remove()
  } else {
    const innerNode = d3.select(node).append('g')

    innerNode.attr('transform', `translate(${margins.top}, ${margins.left})`)

    const xAxisPadding = data.sets.length > 1 ? 0.2 : 0.4
    const height = data.height - margins.top - margins.bottom
    const width = data.width - margins.right - margins.left

    const xScales = data.sets.map((set) => {
      const domain = set.map((d) => _.get(d, data.xAxis))
      return d3
        .scaleBand()
        .domain(domain)
        .rangeRound([0, data.width])
        .padding(xAxisPadding)
    })

    const yMax = Math.max(
      ...data.sets.map((set) => d3.max(set, (d) => _.get(d, data.yAxis))),
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
      .call(d3.axisBottom(xScales[0]))

    innerNode
      .append('text')
      .attr('transform', `translate(${width / 2},${height + xLabelMargin})`)
      .style('text-anchor', 'middle')
      .style('font-size', '0.813rem')
      .text(data.xAxisLabel)

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
      .text(data.yAxisLabel)

    const graphInfo = {
      node,
      innerNode,
      height,
      setCount: data.sets.length,
      colors: data.colors,
      xAxis: data.xAxis,
      yAxis: data.yAxis,
      xScales,
      yScale,
    }

    data.sets.forEach((set, index) => renderBarGraphSet(graphInfo, set, index))
  }
}
