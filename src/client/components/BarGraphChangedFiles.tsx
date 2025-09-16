import { FC } from 'react'
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

const BarGraphChangedFiles: FC<BarGraphChangedFilesProps> = ({
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
        xAxis,
        xAxisLabel: 'Changed Files',
        yAxis,
        yAxisLabel: 'Total Commits',
      }}
    />
  )
}

export default BarGraphChangedFiles
