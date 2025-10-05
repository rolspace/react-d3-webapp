import { ScaleBand, ScaleLinear } from 'd3';

// TODO: change this
export interface BarGraphDataSets {
  sets: BarGraphDataItem[][];
  colors: string[];
  loading: 'idle' | 'pending' | 'succeeded' | 'failed';
  xAxisLabel: string;
  yAxisLabel: string;
}

export interface BarGraphDataItem {
  min: number;
  max: number;
  count: number;
  label: string;
}

export interface BarGraphData {
  sets: Array<BarGraphDataItem[]>;
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
