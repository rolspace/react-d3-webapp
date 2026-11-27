import { describe, expect, it } from 'vitest'
import { DEFAULT_BIN_COUNT, binSeries, binSharedSeries } from '../binning'

describe('binning', () => {
  describe('binSharedSeries', () => {
    it('binSharedSeries_AdditionsAndDeletions_UsesThresholdsFromCombinedExtent', () => {
      const [additions, deletions] = binSharedSeries([[54, 1, 521], [32, 1, 35]])

      expect(additions).toHaveLength(20)
      expect(deletions).toHaveLength(20)
      expect(deletions.map((b) => [b.x0, b.x1])).toEqual(additions.map((b) => [b.x0, b.x1]))
      expect(additions[0]).toEqual({ x0: 1, x1: 28, count: 1, label: '1-27' })
      expect(deletions[deletions.length - 1].x1).toBe(541)
      expect(additions.reduce((sum, b) => sum + b.count, 0)).toBe(3)
      expect(deletions.reduce((sum, b) => sum + b.count, 0)).toBe(3)
    })

    it('binSharedSeries_OneSeriesEmpty_ReturnsEmptyArrayForThatSeries', () => {
      const [nonEmpty, empty] = binSharedSeries([[1, 5, 9], []])

      expect(nonEmpty.length).toBeGreaterThan(0)
      expect(empty).toEqual([])
    })

    it('binSharedSeries_AllSeriesEmpty_ReturnsEmptyArrays', () => {
      expect(binSharedSeries([[], []])).toEqual([[], []])
    })
  })

  describe('binSeries', () => {
    it('binSeries_SingleSeries_UsesOwnExtent', () => {
      const bins = binSeries([3, 1, 7])

      expect(bins.map((b) => b.label)).toEqual(['1', '2', '3', '4', '5', '6', '7'])
      expect(bins.map((b) => b.count)).toEqual([1, 0, 1, 0, 0, 0, 1])
      expect(bins[0].x0).toBe(1)
      expect(bins[bins.length - 1].x1).toBe(8)
    })

    it('binSeries_AllValuesEqual_ReturnsSingleBinWithAllValues', () => {
      const expected = [{ x0: 5, x1: 6, count: 3, label: '5' }]

      expect(binSeries([5, 5, 5])).toEqual(expected)
      expect(binSeries([5, 5, 5], { scale: 'log' })).toEqual(expected)
    })

    it('binSeries_EmptyInput_ReturnsEmptyArray', () => {
      expect(binSeries([])).toEqual([])
      expect(binSeries([], { scale: 'log' })).toEqual([])
    })

    it('binSeries_NoBinCount_DefaultsToTwentyBins', () => {
      const bins = binSeries(Array.from({ length: 100 }, (_, i) => i))

      expect(DEFAULT_BIN_COUNT).toBe(20)
      expect(bins).toHaveLength(20)
      expect(bins[0]).toEqual({ x0: 0, x1: 5, count: 5, label: '0-4' })
      expect(bins.every((b) => b.count === 5)).toBe(true)
    })

    it('binSeries_CustomBinCount_ReturnsAtMostThatManyBins', () => {
      const bins = binSeries([54, 1, 521, 32, 1, 35], { binCount: 5 })

      expect(bins).toHaveLength(5)
      expect(bins[0].label).toBe('1-105')
      expect(bins.reduce((sum, b) => sum + b.count, 0)).toBe(6)
    })

    it('binSeries_LogScaleWithZeros_ComputesLogSpacedThresholds', () => {
      const bins = binSeries([0, 0, 1, 10, 100, 1000], { binCount: 10, scale: 'log' })

      expect(bins.map((b) => b.x0)).toEqual([0, 1, 3, 7, 15, 31, 63, 125, 251, 501])
      expect(bins[0]).toEqual({ x0: 0, x1: 1, count: 2, label: '0' })
      expect(bins[bins.length - 1].x1).toBe(1001)
      expect(bins.reduce((sum, b) => sum + b.count, 0)).toBe(6)
      expect(bins.every((b) => Number.isFinite(b.x0) && Number.isFinite(b.x1))).toBe(true)
    })

    it('binSeries_NonFiniteValues_IgnoresThem', () => {
      const bins = binSeries([1, 2, NaN, Infinity])

      expect(bins.reduce((sum, b) => sum + b.count, 0)).toBe(2)
      expect(bins.every((b) => Number.isFinite(b.x0) && Number.isFinite(b.x1))).toBe(true)
    })
  })
})
