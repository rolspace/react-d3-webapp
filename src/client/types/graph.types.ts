import { ScaleBand, ScaleLinear } from 'd3'

export interface DataItem {
  count: number
  label: string
}

export interface BarGraphData {
  sets: DataItem[][]
}

export type BarGraphDataSets = {
  colors: string[]
  loading: 'idle' | 'pending' | 'succeeded' | 'failed'
  xAxisLabel: string
  yAxisLabel: string
} & BarGraphData

export interface BarGraphStyle {
    colors: string[]
    height: number
    xAxisLabel: string
    width: number
    yAxisLabel: string
}

export interface BarGraphDataSetProperties {
    colors: string[]
    height: number
    setCount: number
    xScale: ScaleBand<string>[]
    yScale: ScaleLinear<number, number, never>
}
