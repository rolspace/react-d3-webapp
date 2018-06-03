import React from 'react'
import PropTypes from 'prop-types'
import BarGraph from './BarGraph'

const labels = {
	xAxisLabel: 'Changed files',
	yAxisLabel: 'Number of commits'
}

class RepoChangedFiles extends React.Component {
	constructor(props) {
		super(props)
	}

	render() {
		const data = [this.props.data['changedFiles']]

		return (
			<BarGraph data={data} xAxis={this.props.xAxis} yAxis={this.props.yAxis} {...labels} />
		)
	}
}

RepoChangedFiles.propTypes = {
	data: PropTypes.object.isRequired,
	xAxis: PropTypes.string.isRequired,
	yAxis: PropTypes.string.isRequired
}

export default RepoChangedFiles