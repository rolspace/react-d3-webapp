import { FC } from 'react'
import { BarGraphDataItem } from '../types/barGraph.types'
import BarGraph from './BarGraph'

interface Datasource {
  linesAdded?: BarGraphDataItem[]
  linesDeleted?: BarGraphDataItem[]
}

interface BarGraphAddsDeletesProps {
  datasource: Datasource
  loading: 'idle' | 'pending' | 'succeeded' | 'failed'
  xAxis: string
  yAxis: string
}

const BarGraphAddsDeletes: FC<BarGraphAddsDeletesProps> = ({ datasource, loading, xAxis, yAxis }) => {
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
        xAxis,
        xAxisLabel: 'Code Lines',
        yAxis,
        yAxisLabel: 'Total Commits',
      }}
    />
  )
}

export default BarGraphAddsDeletes
