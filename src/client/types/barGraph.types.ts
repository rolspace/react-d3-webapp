import { ScaleBand, ScaleLinear } from 'd3'
import { DataItem } from '../types/graph.types'

export interface BarGraphDataSets {
  sets: DataItem[][];
  colors: string[];
  loading: 'idle' | 'pending' | 'succeeded' | 'failed';
  xAxisLabel: string;
  yAxisLabel: string;
}

export interface BarGraphData {
  sets: DataItem[][];
}

export interface BarGraphStyle {
    colors: string[];
    xAxisLabel: string;
    yAxisLabel: string;
    height: number;
    width: number;
}

export interface BarGraphDataSetProperties {
    colors: string[];
    height: number;
    setCount: number;
    xScale: ScaleBand<string>[];
    yScale: ScaleLinear<number, number, never>;
}
