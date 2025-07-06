import PropTypes from 'prop-types'
import React from 'react'
import BarGraph from './BarGraph.jsx'

const BarGraphAddsDeletes = ({ datasource, loading, xAxis, yAxis }) => {
  if (datasource) {
    const { linesAdded = [], linesDeleted = [] } = datasource

    return (
      <BarGraph
        graphData={{
          sets: [linesAdded, linesDeleted],
          colors: ['#2da44e', '#cf222e'],
          loading,
          xAxis,
          xAxisLabel: 'Code Lines',
          yAxis,
          yAxisLabel: 'Total Commits',
        }}
      />
    )
  }

  return null
}

BarGraphAddsDeletes.propTypes = {
  datasource: PropTypes.object.isRequired,
  loading: PropTypes.string.isRequired,
  xAxis: PropTypes.string.isRequired,
  yAxis: PropTypes.string.isRequired,
}

export default BarGraphAddsDeletes
