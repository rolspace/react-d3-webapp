import React from 'react'
import PropTypes from 'prop-types'
import BarGraph from './BarGraph'

class RepoChangedFiles extends React.Component {
	constructor(props) {
		super(props)
	}
  
	render() {
		const data = {
			isLoading: this.props.isLoading,
			sets: [this.props.data['changedFiles']],
			xAxis: this.props.xAxis,
			yAxis: this.props.yAxis,
			xAxisLabel: 'Changed Files',
			yAxisLabel: 'Total Commits'
		}
    
		return (
			<BarGraph data={data} />
		)
	}
}

RepoChangedFiles.propTypes = {
	data: PropTypes.object.isRequired,
	isLoading: PropTypes.bool.isRequired,
	xAxis: PropTypes.string.isRequired,
	yAxis: PropTypes.string.isRequired
}

export default RepoChangedFiles