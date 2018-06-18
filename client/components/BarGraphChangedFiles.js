import React from 'react'
import PropTypes from 'prop-types'
import BarGraph from './BarGraph'

class RepoChangedFiles extends React.Component {
	constructor(props) {
		super(props)
	}

	render() {
		const data = {
			isLoading: this.props.loading,
			sets: [this.props.data['changedFiles']],
			xAxis: this.props.xAxis,
			yAxis: this.props.yAxis,
			xAxisLabel: 'Changed files',
			yAxisLabel: 'Number of commits'
		}

		return (
			<BarGraph data={data} />
		)
	}
}

RepoChangedFiles.propTypes = {
	data: PropTypes.object.isRequired,
	loading: PropTypes.bool.isRequired,
	xAxis: PropTypes.string.isRequired,
	yAxis: PropTypes.string.isRequired
}

export default RepoChangedFiles