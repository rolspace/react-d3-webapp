import React from 'react'
import { CommitData } from '../stores/repoStore'
import BarGraph from './BarGraph'

interface BarGraphChangedFilesProps {
  datasource: CommitData
  loading: 'idle' | 'pending' | 'succeeded' | 'failed'
}

const BarGraphChangedFiles: React.FC<BarGraphChangedFilesProps> = ({
  datasource,
  loading,
}) => {

  if (!datasource) {
    return null
  }

  const { changedFiles = [] } = datasource

  return (
    <BarGraph
      graphData={{
        sets: [changedFiles],
        colors: ['#00bcd4'],
        loading,
        xAxisLabel: 'Changed Files',
        yAxisLabel: 'Total Commits',
      }}
    />
  )
}

export default BarGraphChangedFiles
