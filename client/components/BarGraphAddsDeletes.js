/* eslint-disable no-unused-vars */

import React from 'react'
import PropTypes from 'prop-types'
import Grid from 'material-ui/Grid'
import BarGraph from './BarGraph'

class BarGraphAddsDeletes extends React.Component {
	constructor(props) {
		super(props)
	}

	render() {
		const data = [this.props.data['linesAdded'], this.props.data['linesDeleted']]

		return (
			<BarGraph data={data} xAxis={this.props.xAxis} yAxis={this.props.yAxis} />
		)
	}
}

BarGraphAddsDeletes.propTypes = {
	data: PropTypes.object.isRequired,
	xAxis: PropTypes.string.isRequired,
	yAxis: PropTypes.string.isRequired
}

export default BarGraphAddsDeletes