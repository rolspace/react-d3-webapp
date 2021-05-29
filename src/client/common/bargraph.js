import * as d3 from 'd3'
import _ from 'lodash'

const colors = ['#00bcd4', 'green']
const xLabelMargin = 35
const yLabelMargin = 50
const margins = { top: 40, right: 40, bottom: 40, left: 40 }

export function renderBarGraph(node, data) {
	if (data.sets.every(set => !set.length)) {
		d3.select(node).selectAll('*').remove()
	}
	else {
		const innerNode = d3.select(node).append('g')

		innerNode.attr('transform', `translate(${margins.top}, ${margins.left})`)

		const xAxisPadding = data.sets.length > 1 ? 0.2 : 0.4
		const height = data.height - margins.top - margins.bottom
		const	width = data.width - margins.right - margins.left

		const xScales = data.sets.map(set => {
			const domain = set.map(d => _.get(d, data.xAxis))
			return d3.scaleBand().domain(domain).rangeRound([0, data.width]).padding(xAxisPadding)
		})

		const yMax = Math.max(...data.sets.map(set => d3.max(set, d => _.get(d, data.yAxis))))
		const yTrueMax = yMax % 10 === 0 ? yMax : yMax + (10 - (yMax % 10))
		const yScale = d3.scaleLinear().domain([0, yTrueMax]).rangeRound([height, 0])

		innerNode.append('g').attr('class', 'axis axis--x')
			.attr('transform', `translate(0, ${height})`)
			.call(d3.axisBottom(xScales[0]))

		innerNode.append('text')
			.attr('transform', `translate(${width / 2},${height + xLabelMargin})`)
			.style('text-anchor', 'middle').style('font-size', '0.813rem')
			.text(data.xAxisLabel);

		innerNode.append('g').attr('class', 'axis axis--y')
			.call(d3.axisLeft(yScale).ticks(9))

		innerNode.append('text')
			.attr('transform', 'rotate(-90)').attr('x', 0 - height/2)
			.attr('y', 0 - yLabelMargin).attr('dy', '1em')
			.style('text-anchor', 'middle').style('font-size', '0.813rem')
			.text(data.yAxisLabel)

		data.sets.forEach(renderBarGraphSet, {
			node,
			innerNode,
			height,
			setCount: data.sets.length,
			xAxis: data.xAxis,
			yAxis: data.yAxis,
			xScales,
			yScale
		})
	}
}

function renderBarGraphSet(set, index) {
	this.innerNode.selectAll('bar').data(set)
		.enter().append('rect')
		.style('fill', colors[index]).style('stroke-width', 1).style('stroke', '#000')
		.attr('x', d => this.xScales[index](_.get(d, this.xAxis)) + (index !== 0 ? this.xScales[index].bandwidth()/2 : 0))
		.attr('width', this.setCount > 1 ? this.xScales[index].bandwidth()/2 : this.xScales[index].bandwidth())
		.attr('y', d => this.yScale(_.get(d, this.yAxis)))
		.attr('height', d => this.height - this.yScale(_.get(d, this.yAxis)))
}
