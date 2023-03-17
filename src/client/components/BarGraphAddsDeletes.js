import PropTypes from 'prop-types'
import React from 'react'
import BarGraph from './BarGraph'

const BarGraphAddsDeletes = ({ datasource, xAxis, yAxis, isLoading }) => {
  const { linesAdded, linesDeleted } = datasource

  return (
    <BarGraph
      graphData={{
        sets: [linesAdded, linesDeleted],
        colors: ['#2da44e', '#cf222e'],
        xAxis,
        xAxisLabel: 'Code Lines',
        yAxis,
        yAxisLabel: 'Total Commits',
        isLoading,
      }}
    />
  )
}

BarGraphAddsDeletes.propTypes = {
  datasource: PropTypes.object.isRequired,
  xAxis: PropTypes.string.isRequired,
  yAxis: PropTypes.string.isRequired,
  isLoading: PropTypes.bool.isRequired,
}

export default BarGraphAddsDeletes
