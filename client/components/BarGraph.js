/* eslint-disable no-unused-vars */

import React from 'react'
import PropTypes from 'prop-types'
import { withStyles } from 'material-ui/styles'
import Grid from 'material-ui/Grid'
import graphRenderer from '../common/bargraph'

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

class BarGraph extends React.Component {
	constructor(props) {
		super(props)
		this.renderGraph = this.renderGraph.bind(this)
	}

	componentDidUpdate() {
		this.renderGraph()
	}

	renderGraph() {
		const node = this.node;

		const graphData = {
			sets: this.props.data,
			height: 500,
			width: 800,
			xAxis: this.props.xAxis,
			yAxis: this.props.yAxis
		}

		const renderer = new graphRenderer(node, graphData)
		renderer.renderGraph()
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

BarGraph.propTypes = {
	classes: PropTypes.object.isRequired,
	data: PropTypes.array.isRequired,
	xAxis: PropTypes.string.isRequired,
	yAxis: PropTypes.string.isRequired
}

export default withStyles(styles)(BarGraph)