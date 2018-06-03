import React from 'react'
import PropTypes from 'prop-types'
import BarGraph from './BarGraph'

const labels = {
	xAxisLabel: 'Lines of code',
	yAxisLabel: 'Number of commits'
}

class BarGraphAddsDeletes extends React.Component {
	constructor(props) {
		super(props)
	}

	render() {
		const data = [this.props.data['linesAdded'], this.props.data['linesDeleted']]

		return (
			<BarGraph data={data} xAxis={this.props.xAxis} yAxis={this.props.yAxis} {...labels} />
		)
	}
}

BarGraphAddsDeletes.propTypes = {
	data: PropTypes.object.isRequired,
	xAxis: PropTypes.string.isRequired,
	yAxis: PropTypes.string.isRequired
}

export default BarGraphAddsDeletes