/* eslint-disable no-unused-vars */

import React from 'react'
import PropTypes from 'prop-types'
import { withStyles } from 'material-ui/styles'
import Grid from 'material-ui/Grid'
import GroupedBarGraphRenderer from '../common/graphs'

const styles = {
	container: {
		overflowX: 'scroll'
	},
	svg: {
		height: '75vh',
		minWidth: '700px',
		width: '100%'
	}
}

class GroupedBarGraph extends React.Component {
	constructor(props) {
		super(props)
		this.renderGraph = this.renderGraph.bind(this)
	}

	renderGraph() {
		const node = this.node;

		const graphData = {
			sets: [ this.props.data.linesAdded, this.props.data.linesDeleted],
			height: 500,
			width: 800,
			xAxis: this.props.xAxis,
			yAxis: this.props.yAxis
		}

		const renderer = new GroupedBarGraphRenderer(node, graphData)
		renderer.renderGraph()
	}

	componentDidUpdate() {
		if (this.props.data.linesAdded.length && this.props.data.linesDeleted.length) {
			this.renderGraph()
		}
	}

	render() {
		const { classes } = this.props

		return (
			<div>
				<Grid container className={classes.container}>
					<Grid item xs={12}>
						<svg ref={node => this.node = node} className={classes.svg} viewBox='0 0 800 500'></svg>
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