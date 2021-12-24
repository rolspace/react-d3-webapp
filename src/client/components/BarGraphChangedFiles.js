import PropTypes from 'prop-types'
import React from 'react'
import BarGraph from './BarGraph'

const RepoChangedFiles = ({ data, isLoading, xAxis, yAxis }) => {
  const graphData = {
    isLoading: isLoading,
    sets: [data.changedFiles],
    xAxis: xAxis,
    yAxis: yAxis,
    xAxisLabel: 'Changed Files',
    yAxisLabel: 'Total Commits',
  }

  return (
		<BarGraph data={graphData} />
  )
}

RepoChangedFiles.propTypes = {
  data: PropTypes.object.isRequired,
  isLoading: PropTypes.bool.isRequired,
  xAxis: PropTypes.string.isRequired,
  yAxis: PropTypes.string.isRequired,
}

export default RepoChangedFiles
