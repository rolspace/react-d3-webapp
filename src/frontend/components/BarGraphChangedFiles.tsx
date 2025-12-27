import React from 'react'
import { CommitData } from '../stores/repoStore'
import { Status } from '../types/state.types'
import BarGraph from './BarGraph'

interface BarGraphChangedFilesProps {
  datasource: CommitData
  status: Status
}

const BarGraphChangedFiles: React.FC<BarGraphChangedFilesProps> = ({
  datasource,
  status,
}) => {
  if (!datasource) {
    return null
  }

  const { changedFiles = [] } = datasource

  return (
    <BarGraph
      graphStyle={{
        colors: ['#00bcd4'],
        xAxisLabel: 'Changed Files',
        yAxisLabel: 'Total Commits',
      }}
      sets={[changedFiles]}
      status={status}
    />
  )
}

export default BarGraphChangedFiles
