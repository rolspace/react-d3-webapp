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
		const sets = [this.props.data['linesAdded'], this.props.data['linesDeleted']]

		return (
			<BarGraph loading={this.props.loading} sets={sets} xAxis={this.props.xAxis} yAxis={this.props.yAxis} {...labels} />
		)
	}
}

BarGraphAddsDeletes.propTypes = {
	data: PropTypes.object.isRequired,
	loading: PropTypes.bool.isRequired,
	xAxis: PropTypes.string.isRequired,
	yAxis: PropTypes.string.isRequired
}

export default BarGraphAddsDeletes