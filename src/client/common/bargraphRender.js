import * as d3 from 'd3'
import _ from 'lodash'

const colors = ['#00bcd4', 'green']
const xLabelMargin = 35
const yLabelMargin = 50
const margins = { top: 40, right: 40, bottom: 40, left: 40 }

class BarGraphRender {
	constructor(node, data) {
		this.node = node
		this.innerNode = d3.select(this.node).append('g')

		this.sets = data.sets
		this.setCount = data.sets.length

		if (this.setCount > 0) {
			this.xAxis = data.xAxis
			this.yAxis = data.yAxis
			this.xAxisLabel = data.xAxisLabel
			this.yAxisLabel = data.yAxisLabel
			this.width = data.width - margins.right - margins.left
			this.height = data.height - margins.top - margins.bottom
			this.renderGraph = this.renderGraph.bind(this)
			this.renderSet = this.renderSet.bind(this)

			const xAxisPadding = this.setCount > 1 ? 0.2 : 0.4
			this.xScales = this.sets.map(set => {
				const domain = set.map(d => _.get(d, this.xAxis))
				return d3.scaleBand().domain(domain).rangeRound([0, data.width]).padding(xAxisPadding)
			})

			const yMax = Math.max(...this.sets.map(set => d3.max(set, d => _.get(d, this.yAxis))))
			const yTrueMax = yMax % 10 === 0 ? yMax : yMax + (10 - (yMax % 10))
			this.yScale = d3.scaleLinear().domain([0, yTrueMax]).rangeRound([this.height, 0])
		}
	}

	renderSet(set, index) {
		this.innerNode.selectAll('bar').data(set)
      .enter().append('rect')
      .style('fill', colors[index]).style('stroke-width', 1).style('stroke', '#000')
      .attr('x', d => this.xScales[index](_.get(d, this.xAxis)) + (index !== 0 ? this.xScales[index].bandwidth()/2 : 0))
      .attr('width', this.setCount > 1 ? this.xScales[index].bandwidth()/2 : this.xScales[index].bandwidth())
      .attr('y', d => this.yScale(_.get(d, this.yAxis)))
      .attr('height', d => this.height - this.yScale(_.get(d, this.yAxis)))
      .on('mouseover', this.tip.show)
      .on('mouseout', this.tip.hide)
	}

	renderGraph() {
		if (this.sets.every(set => !set.length)) {
			d3.select(this.node).selectAll('*').remove()
		}
		else {
			this.innerNode.attr('transform', `translate(${margins.top}, ${margins.left})`)

			this.innerNode.append('g').attr('class', 'axis axis--x')
        .attr('transform', `translate(0, ${this.height})`)
        .call(d3.axisBottom(this.xScales[0]))

			this.innerNode.append('text')
        .attr('transform', `translate(${this.width / 2},${this.height + xLabelMargin})`)
        .style('text-anchor', 'middle').style('font-size', '0.813rem')
        .text(this.xAxisLabel);

			this.innerNode.append('g').attr('class', 'axis axis--y')
        .call(d3.axisLeft(this.yScale).ticks(9))

			this.innerNode.append('text')
        .attr('transform', 'rotate(-90)').attr('x', 0 - this.height/2)
        .attr('y', 0 - yLabelMargin).attr('dy', '1em')
        .style('text-anchor', 'middle').style('font-size', '0.813rem')
        .text(this.yAxisLabel)

			this.sets.forEach(this.renderSet)
		}
	}
}

export default BarGraphRender
