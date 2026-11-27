import { bin, range } from 'd3'
import { DataItem } from '../types/graph.types'

export type BinScale = 'linear' | 'log'

export interface BinOptions {
  binCount?: number
  scale?: BinScale
}

/** A histogram bin over the half-open integer range [x0, x1). */
export interface HistogramBin extends DataItem {
  x0: number
  x1: number
}

export interface BinLayout {
  domain: [number, number]
  thresholds: number[]
}

export const DEFAULT_BIN_COUNT = 20
export const MIN_BIN_COUNT = 5
export const MAX_BIN_COUNT = 50
/** Added before log10 so that zero values map to log10(1) = 0. */
export const LOG_OFFSET = 1

const finite = (values: number[]): number[] => values.filter(Number.isFinite)

const labelFor = (x0: number, x1: number): string =>
  x1 - x0 === 1 ? String(x0) : `${x0}-${x1 - 1}`

export function computeBinLayout(values: number[], options: BinOptions = {}): BinLayout | null {
  const clean = finite(values)
  if (clean.length === 0) {
    return null
  }

  const binCount = Math.max(1, Math.floor(options.binCount ?? DEFAULT_BIN_COUNT))
  const min = Math.min(...clean)
  const max = Math.max(...clean)

  if (options.scale === 'log') {
    const lo = Math.log10(min + LOG_OFFSET)
    const hi = Math.log10(max + LOG_OFFSET)
    const raw = range(1, binCount).map((i) =>
      Math.ceil(10 ** (lo + (i * (hi - lo)) / binCount) - LOG_OFFSET),
    )
    const thresholds = Array.from(new Set(raw)).filter((t) => t > min && t <= max)
    return { domain: [min, max + 1], thresholds }
  }

  const span = max - min + 1
  const width = Math.max(1, Math.ceil(span / binCount))
  const count = Math.ceil(span / width)
  return {
    domain: [min, min + count * width],
    thresholds: range(1, count).map((i) => min + i * width),
  }
}

export function binValues(values: number[], layout: BinLayout): HistogramBin[] {
  const clean = finite(values)
  if (clean.length === 0) {
    return []
  }

  return bin<number, number>()
    .domain(layout.domain)
    .thresholds(layout.thresholds)(clean)
    .map((b) => {
      const x0 = b.x0 ?? layout.domain[0]
      const x1 = b.x1 ?? layout.domain[1]
      return { x0, x1, count: b.length, label: labelFor(x0, x1) }
    })
}

/** Bins one series using thresholds computed from that series only. */
export function binSeries(values: number[], options: BinOptions = {}): HistogramBin[] {
  const layout = computeBinLayout(values, options)
  return layout ? binValues(values, layout) : []
}

/**
 * Bins several series over one set of thresholds computed from their combined
 * extent, so that bars line up on a shared axis. An empty series yields [].
 */
export function binSharedSeries(series: number[][], options: BinOptions = {}): HistogramBin[][] {
  const layout = computeBinLayout(series.flat(), options)
  return series.map((values) => (layout ? binValues(values, layout) : []))
}
