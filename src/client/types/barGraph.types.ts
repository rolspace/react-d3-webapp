import { ScaleBand, ScaleLinear } from 'd3';

// TODO: change this
export interface BarGraphDataSets {
  sets: BarGraphDataItem[][];
  colors: string[];
  loading: 'idle' | 'pending' | 'succeeded' | 'failed';
  xAxis: string;
  xAxisLabel: string;
  yAxis: string;
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
  xAxis: string;
  yAxis: string;
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
    xAxis: string;
    xScales: ScaleBand<string>[];
    yAxis: string;
    yScale: ScaleLinear<number, number, never>;
}
