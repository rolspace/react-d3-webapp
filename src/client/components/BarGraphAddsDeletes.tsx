import React from 'react'
import { CommitData } from '../stores/repoStore'
import BarGraph from './BarGraph'

interface BarGraphAddsDeletesProps {
  datasource: CommitData
  loading: 'idle' | 'pending' | 'succeeded' | 'failed'
}

const BarGraphAddsDeletes: React.FC<BarGraphAddsDeletesProps> = ({ datasource, loading }) => {
  if (!datasource) {
    return null
  }

  const { linesAdded = [], linesDeleted = [] } = datasource

  return (
    <BarGraph
      graphData={{
        sets: [linesAdded, linesDeleted],
        colors: ['#2da44e', '#cf222e'],
        loading,
        xAxisLabel: 'Code Lines',
        yAxisLabel: 'Total Commits',
      }}
    />
  )
}

export default BarGraphAddsDeletes
