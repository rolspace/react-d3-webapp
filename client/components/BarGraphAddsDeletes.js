import React from 'react'
import PropTypes from 'prop-types'
import BarGraph from './BarGraph'

class BarGraphAddsDeletes extends React.Component {
	constructor(props) {
		super(props)
	}

	render() {
		const data = {
			isLoading: this.props.isLoading,
			sets: [this.props.data['linesAdded'], this.props.data['linesDeleted']],
			xAxis: this.props.xAxis,
			yAxis: this.props.yAxis,
			xAxisLabel: 'Lines of code',
			yAxisLabel: 'Number of commits'
		}

		return (
			<BarGraph data={data} />
		)
	}
}

BarGraphAddsDeletes.propTypes = {
	data: PropTypes.object.isRequired,
	isLoading: PropTypes.bool.isRequired,
	xAxis: PropTypes.string.isRequired,
	yAxis: PropTypes.string.isRequired
}

export default BarGraphAddsDeletes