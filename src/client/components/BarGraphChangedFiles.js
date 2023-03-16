import PropTypes from 'prop-types'
import React from 'react'
import BarGraph from './BarGraph'

const RepoChangedFiles = ({ data, isLoading, xAxis, yAxis }) => {
  const graphData = {
    isLoading,
    sets: [data.changedFiles],
    colors: ['#00bcd4'],
    xAxis,
    yAxis,
    xAxisLabel: 'Changed Files',
    yAxisLabel: 'Total Commits',
  }

  return <BarGraph data={graphData} />
}

RepoChangedFiles.propTypes = {
  data: PropTypes.object.isRequired,
  isLoading: PropTypes.bool.isRequired,
  xAxis: PropTypes.string.isRequired,
  yAxis: PropTypes.string.isRequired,
}

export default RepoChangedFiles
