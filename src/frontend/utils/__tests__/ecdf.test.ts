import * as d3 from 'd3'
import { describe, expect, it } from 'vitest'
import { computeEcdf, ecdfAt, ecdfQuantile, ecdfStops } from '../ecdf'

describe('ecdf', () => {
  describe('computeEcdf', () => {
    it('computeEcdf_UnsortedValues_ReturnsAscendingSteps', () => {
      const e = computeEcdf([5, 1, 3, 10])

      expect(e.steps.map((s) => s.value)).toEqual([1, 3, 5, 10])
      expect(e.total).toBe(4)
    })

    it('computeEcdf_AnyInput_LastFractionIsExactlyOne', () => {
      const { steps } = computeEcdf([7, 2, 2, 9, 4, 4, 4])

      expect(steps[steps.length - 1].fraction).toBe(1)
      for (let i = 1; i < steps.length; i++) {
        expect(steps[i].fraction).toBeGreaterThanOrEqual(steps[i - 1].fraction)
      }
    })

    it('computeEcdf_DuplicateValues_CollapseToOneStep', () => {
      const e = computeEcdf([5, 1, 3, 3, 10])

      expect(e.steps).toHaveLength(4)
      expect(e.steps[1]).toEqual({ value: 3, count: 2, cumulativeCount: 3, fraction: 0.6 })
    })

    it('computeEcdf_SingleValue_ReturnsOneStepAtOne', () => {
      expect(computeEcdf([42]).steps).toEqual([
        { value: 42, count: 1, cumulativeCount: 1, fraction: 1 },
      ])
    })

    it('computeEcdf_EmptyInput_ReturnsNoSteps', () => {
      expect(computeEcdf([])).toEqual({ steps: [], total: 0 })
    })

    it('computeEcdf_NullAndNonNumericValues_ExcludesThemWithoutThrowing', () => {
      const e = computeEcdf([3, null, NaN, '7', undefined, Infinity, 1])

      expect(e.steps.map((s) => s.value)).toEqual([1, 3])
      expect(e.total).toBe(2)
    })

    it('computeEcdf_InputArray_IsNotMutated', () => {
      const input = [3, 1, 2]
      computeEcdf(input)

      expect(input).toEqual([3, 1, 2])
    })
  })

  describe('ecdfAt', () => {
    it('ecdfAt_VariousX_ReturnsShareAtOrBelow', () => {
      const e = computeEcdf([5, 1, 3, 3, 10])

      expect(ecdfAt(e, 0)).toBe(0)
      expect(ecdfAt(e, 3)).toBe(0.6)
      expect(ecdfAt(e, 4)).toBe(0.6)
      expect(ecdfAt(e, 10)).toBe(1)
      expect(ecdfAt(e, 100)).toBe(1)
      expect(ecdfAt(computeEcdf([]), 5)).toBe(0)
    })
  })

  describe('ecdfQuantile', () => {
    it('ecdfQuantile_MedianAndP90_ReturnsObservedStepValues', () => {
      const e = computeEcdf([5, 1, 3, 3, 10])

      expect(ecdfQuantile(e, 0.5)).toBe(3)
      expect(ecdfQuantile(e, 0.9)).toBe(10)
    })

    it('ecdfQuantile_ExactBoundary_ReturnsValueReachingTarget', () => {
      const e = computeEcdf(d3.range(1, 11))

      expect(ecdfQuantile(e, 0.5)).toBe(5)
      expect(ecdfQuantile(e, 0.9)).toBe(9)
    })

    it('ecdfQuantile_EmptyOrOutOfRange_ReturnsNull', () => {
      const e = computeEcdf([1, 2, 3])

      expect(ecdfQuantile(computeEcdf([]), 0.5)).toBeNull()
      expect(ecdfQuantile(e, 0)).toBeNull()
      expect(ecdfQuantile(e, 1.5)).toBeNull()
    })
  })

  describe('ecdfStops', () => {
    it('ecdfStops_TwoEcdfs_ReturnsSortedDistinctUnion', () => {
      const stops = ecdfStops([computeEcdf([10, 20, 20]), computeEcdf([5, 20, 40])])

      expect(stops).toEqual([5, 10, 20, 40])
    })
  })
})
