export interface DataItem {
  count: number
  label: string
}

export type BarGraphDataSets = DataItem[][]

export interface BarGraphStyle {
  colors: string[]
  height: number
  width: number
  xAxisLabel: string
  yAxisLabel: string
}
