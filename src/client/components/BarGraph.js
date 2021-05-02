import React from 'react'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'
import CircularProgress from '@material-ui/core/CircularProgress'
import Grid from '@material-ui/core/Grid'
import GraphRender from '../common/bargraph'

const styles = (theme) => ({
	circle: {
		r: 5
	},
	container: {
		overflowX: 'scroll'
	},
	root: {
		width: '100%'
	},
	svg: {
		fontFamily: theme.typography.fontFamily,
		height: '73vh',
		minWidth: '700px',
		width: '100%'
	},
	circleRoot: {
		left: '45%',
		position: 'absolute',
		top: '50%',
	}
})

class BarGraph extends React.Component {
	constructor(props) {
		super(props)
		this.renderGraph = this.renderGraph.bind(this)
	}

	componentDidUpdate() {
		this.renderGraph()
	}

	componentDidMount() {
		this.renderGraph()
	}

	renderGraph() {
		const node = this.node;

		const data = {
			sets: this.props.data.sets,
			xAxis: this.props.data.xAxis,
			yAxis: this.props.data.yAxis,
			xAxisLabel: this.props.data.xAxisLabel,
			yAxisLabel: this.props.data.yAxisLabel,
			height: 500,
			width: 800
		}

		const graphRender = new GraphRender(node, data)
		graphRender.renderGraph()
	}

	render() {
		const { classes } = this.props

		return (
			<div>
        <Grid container className={classes.container}>
          <Grid item xs={12} style={{ height: '75vh' }}>
            {this.props.data.isLoading ?
              <CircularProgress classes={{ root: classes.circleRoot }} />
              :
              <svg ref={node => this.node = node} className={classes.svg} viewBox='0 0 800 500'></svg>
            }
          </Grid>
        </Grid>
			</div>
		)
	}
}

BarGraph.propTypes = {
	classes: PropTypes.object.isRequired,
	data: PropTypes.object.isRequired,
}

export default withStyles(styles)(BarGraph)
