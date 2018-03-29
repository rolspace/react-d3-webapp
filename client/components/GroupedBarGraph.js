/* eslint-disable no-unused-vars */

import React from 'react'
import PropTypes from 'prop-types'
import { groupedBarGraph } from '../common/graphs'

class GroupedBarGraph extends React.Component {
	constructor(props) {
		super(props)
		this.renderChart = this.renderChart.bind(this)
	}

	renderChart() {
		const node = this.node;

		const graph = {
			data: this.props.data,
			xAxis: this.props.xAxis,
			yAxis: this.props.yAxis
		}

		groupedBarGraph(node, graph, 800, 500)
	}

	componentDidUpdate() {
		this.renderChart()
	}

	render() {
		return (
			<div>
				<svg ref={node => this.node = node} style={{border:'1px solid'}} width={800} height={500}>
				</svg>
			</div>
		)
	}
}

GroupedBarGraph.propTypes = {
	data: PropTypes.object.isRequired,
	xAxis: PropTypes.string.isRequired,
	yAxis: PropTypes.string.isRequired
}

export default GroupedBarGraph