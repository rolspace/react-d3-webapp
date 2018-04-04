/* eslint-disable no-unused-vars */

import React from 'react'
import PropTypes from 'prop-types'
import { withStyles } from 'material-ui/styles'
import Grid from 'material-ui/Grid'
import { groupedBarGraph } from '../common/graphs'

const styles = {
	container: {
		overflowX: 'scroll'
	}
}

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
		const { classes } = this.props

		return (
			<div>
				<Grid container className={classes.container}>
					<Grid item xs={12}>
						<svg ref={node => this.node = node} viewBox='0 0 800 500' style={{border:'1px solid', minWidth:'700px'}}></svg>
					</Grid>
				</Grid>
			</div>
		)
	}
}

GroupedBarGraph.propTypes = {
	classes: PropTypes.object.isRequired,
	data: PropTypes.object.isRequired,
	xAxis: PropTypes.string.isRequired,
	yAxis: PropTypes.string.isRequired
}

export default withStyles(styles)(GroupedBarGraph)