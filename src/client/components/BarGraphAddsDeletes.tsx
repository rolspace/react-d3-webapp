import React from 'react'
import { CommitData } from '../stores/repoStore'
import { Status } from '../types/state.types'
import BarGraph from './BarGraph'

interface BarGraphAddsDeletesProps {
  datasource: CommitData
  status: Status
}

const BarGraphAddsDeletes: React.FC<BarGraphAddsDeletesProps> = ({ datasource, status }) => {
  if (!datasource) {
    return null
  }

  const { linesAdded = [], linesDeleted = [] } = datasource

  return (
    <BarGraph
      graphData={{
        sets: [linesAdded, linesDeleted],
        colors: ['#2da44e', '#cf222e'],
        xAxisLabel: 'Code Lines',
        yAxisLabel: 'Total Commits',
      }}
      status={status}
    />
  )
}

export default BarGraphAddsDeletes
