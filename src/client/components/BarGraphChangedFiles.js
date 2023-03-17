import PropTypes from 'prop-types'
import React from 'react'
import BarGraph from './BarGraph'

const RepoChangedFiles = ({ datasource, xAxis, yAxis, isLoading }) => {
  const { changedFiles } = datasource

  return (
    <BarGraph
      graphData={{
        sets: [changedFiles],
        colors: ['#00bcd4'],
        xAxis,
        xAxisLabel: 'Changed Files',
        yAxis,
        yAxisLabel: 'Total Commits',
        isLoading,
      }}
    />
  )
}

RepoChangedFiles.propTypes = {
  datasource: PropTypes.object.isRequired,
  xAxis: PropTypes.string.isRequired,
  yAxis: PropTypes.string.isRequired,
  isLoading: PropTypes.bool.isRequired,
}

export default RepoChangedFiles
