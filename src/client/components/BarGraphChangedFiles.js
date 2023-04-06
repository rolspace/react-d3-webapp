import PropTypes from 'prop-types'
import React from 'react'
import BarGraph from './BarGraph'

const RepoChangedFiles = ({ datasource, loading, xAxis, yAxis }) => {
  const { changedFiles } = datasource

  return (
    <BarGraph
      graphData={{
        sets: [changedFiles],
        colors: ['#00bcd4'],
        loading,
        xAxis,
        xAxisLabel: 'Changed Files',
        yAxis,
        yAxisLabel: 'Total Commits',
      }}
    />
  )
}

RepoChangedFiles.propTypes = {
  datasource: PropTypes.object.isRequired,
  loading: PropTypes.string.isRequired,
  xAxis: PropTypes.string.isRequired,
  yAxis: PropTypes.string.isRequired,
}

export default RepoChangedFiles
