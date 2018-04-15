import * as d3 from 'd3'
import _ from 'lodash'

export function groupedBarGraph(node, barchart, containerWidth, containerHeight) {
	const margins = { top: 40, right: 40, bottom: 40, left: 40 }
	const width = containerWidth - margins.right - margins.left
	const height = containerHeight - margins.top - margins.bottom

	const xDomain1 = barchart.data.linesAdded.map(d => _.get(d, barchart.xAxis))
	const xDomain2 = barchart.data.linesDeleted.map(d => _.get(d, barchart.xAxis))
	const y1Max = d3.max(barchart.data.linesAdded, d => _.get(d, barchart.yAxis))
	const y2Max = d3.max(barchart.data.linesDeleted, d => _.get(d, barchart.yAxis))

	const x1 = d3.scaleBand().domain(xDomain1).rangeRound([0, width]).padding(0.1)
	const x2 = d3.scaleBand().domain(xDomain2).rangeRound([0, width]).padding(0.1)
	const y = d3.scaleLinear().domain([0, d3.max([y1Max, y2Max])]).rangeRound([height, 0])

	if (barchart.data.linesAdded.length && barchart.data.linesDeleted.length) {
		const topG = d3.select(node).append('g')
			.attr('transform', `translate(${margins.top}, ${margins.left})`)

		topG.append('g').attr('class', 'axis axis--x')
			.attr('transform', `translate(0, ${height})`)
			.call(d3.axisBottom(x1))

		topG.append('g').attr('class', 'axis axis--y')
			.call(d3.axisLeft(y).ticks(9))

		topG.selectAll('bar').data(barchart.data.linesAdded)
			.enter().append('rect')
			.style('fill', 'blue')
			.attr('x', d => x1(_.get(d, barchart.xAxis)))
			.attr('width', x1.bandwidth()/2)
			.attr('y', d => y(_.get(d, barchart.yAxis)))
			.attr('height', d => height - y(_.get(d, barchart.yAxis)));

		topG.selectAll('bar').data(barchart.data.linesDeleted)
			.enter().append('rect')
			.style('fill', 'green')
			.attr('x', d => x2(_.get(d, barchart.xAxis)) + x2.bandwidth()/2)
			.attr('width', x2.bandwidth()/2)
			.attr('y', d => y(_.get(d, barchart.yAxis)))
			.attr('height', d => height - y(_.get(d, barchart.yAxis)));
	}
	else {
		d3.select(node).selectAll('*').remove()
	}
}