import React from 'react'
import { BarGraphDataItem } from '../types/barGraph.types'
import BarGraph from './BarGraph'

interface DataSource {
  changedFiles: BarGraphDataItem[]
}

interface BarGraphChangedFilesProps {
  datasource: DataSource
  loading: 'idle' | 'pending' | 'succeeded' | 'failed'
  xAxis: string
  yAxis: string
}

const BarGraphChangedFiles: React.FC<BarGraphChangedFilesProps> = ({
  datasource,
  loading,
  xAxis,
  yAxis
}) => {
  const { changedFiles } = datasource

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
