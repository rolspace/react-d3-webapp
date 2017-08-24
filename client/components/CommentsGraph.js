/* eslint-disable no-unused-vars */

import React from 'react'
import PropTypes from 'prop-types'
import BarChart from '../common/barchart'

class CommentsGraph extends React.Component {
	constructor(props) {
		super(props)
		this.renderChart = this.renderChart.bind(this)
	}

	renderChart() {
		const node = this.node;

		const barchart = {
			data: this.props.media,
			xAxis: 'createdTime',
			yAxis: 'comments.count'
		}

		BarChart.create(node, barchart, 800, 500)
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

CommentsGraph.propTypes = {
	media: PropTypes.array,
	user: PropTypes.object
}

export default CommentsGraph