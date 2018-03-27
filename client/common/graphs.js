import * as d3 from 'd3'
import _ from 'lodash'

export function groupedBarGraph(node, barchart, containerWidth, containerHeight) {
	const margins = { top: 40, right: 40, bottom: 40, left: 40 }
	const width = containerWidth - margins.right - margins.left
	const height = containerHeight - margins.top - margins.bottom

	const xDomain = barchart.data.map(d => _.get(d, barchart.xAxis))
	const yDomain = d3.max(barchart.data, d => _.get(d, barchart.yAxis))

	const x = d3.scaleBand().domain(xDomain).rangeRound([0, width]).padding(0.1)
	const y = d3.scaleLinear().domain([0, yDomain]).rangeRound([height, 0])

	const topG = d3.select(node).append('g')
		.attr('transform', `translate(${margins.top}, ${margins.left})`)

	topG.append('g').attr('class', 'axis axis--x')
		.attr('transform', `translate(0, ${height})`)
		.call(d3.axisBottom(x))

	topG.append('g').attr('class', 'axis axis--y')
		.call(d3.axisLeft(y).ticks(9))

	topG.selectAll('bar').data(barchart.data)
		.enter().append('rect')
		.style('fill', 'blue')
		.attr('x', d => x(_.get(d, barchart.xAxis)))
		.attr('width', x.bandwidth())
		.attr('y', d => y(_.get(d, barchart.yAxis)))
		.attr('height', d => height - y(_.get(d, barchart.yAxis)));
}