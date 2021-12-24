import PropTypes from 'prop-types'
import React from 'react'
import BarGraph from './BarGraph'

const BarGraphAddsDeletes = ({ data, isLoading, xAxis, yAxis }) => {
	const graphData = {
		isLoading: isLoading,
		sets: [data['linesAdded'], data['linesDeleted']],
		xAxis: xAxis,
		yAxis: yAxis,
		xAxisLabel: 'Code Lines',
		yAxisLabel: 'Total Commits'
	}

	return (
		<BarGraph data={graphData} />
	)
}

BarGraphAddsDeletes.propTypes = {
	data: PropTypes.object.isRequired,
	isLoading: PropTypes.bool.isRequired,
	xAxis: PropTypes.string.isRequired,
	yAxis: PropTypes.string.isRequired
}

export default BarGraphAddsDeletes
