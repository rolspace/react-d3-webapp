import { describe, expect, it } from 'vitest'
import { computeEcdf, ecdfQuantile } from '../../utils/ecdf'
import { createEcdfLayout, EcdfSeries, logTickValues } from '../ecdfChart'
import { CHART_WIDTH, CHART_MARGINS } from '../chartScaffold'

const seriesOf = (values: number[]): EcdfSeries => {
  const ecdf = computeEcdf(values)
  return {
    key: 'additions',
    label: 'Additions',
    color: '#000',
    ecdf,
    median: ecdfQuantile(ecdf, 0.5),
    p90: ecdfQuantile(ecdf, 0.9),
  }
}

const innerWidth = CHART_WIDTH - CHART_MARGINS.left - CHART_MARGINS.right

describe('ecdfChart', () => {
  describe('createEcdfLayout', () => {
    it('createEcdfLayout_NoData_ReturnsNull', () => {
      expect(createEcdfLayout([seriesOf([])], 'linear')).toBeNull()
    })

    it('createEcdfLayout_TwoSeries_UsesCombinedExtent', () => {
      const layout = createEcdfLayout([seriesOf([10, 20, 300]), seriesOf([0, 5, 40])], 'linear')

      expect(layout).not.toBeNull()
      expect(layout!.domain[0]).toBeLessThanOrEqual(0)
      expect(layout!.domain[1]).toBeGreaterThanOrEqual(300)
      expect(layout!.xTicks).toBeNull()
    })

    it('createEcdfLayout_AllValuesEqual_PadsDomainAroundValue', () => {
      const layout = createEcdfLayout([seriesOf([7, 7, 7])], 'linear')!
      const { domain: [lo, hi] } = layout

      expect(lo).toBeLessThanOrEqual(6)
      expect(hi).toBeGreaterThanOrEqual(8)
      expect(layout.x(7)).toBeGreaterThan(layout.x(lo))
      expect(layout.x(7)).toBeLessThan(layout.x(hi))
    })

    it('createEcdfLayout_LogScaleWithZeros_MapsZeroToLeftEdgeWithoutNaN', () => {
      const layout = createEcdfLayout([seriesOf([0, 1, 10, 300])], 'log')!

      expect(layout.x(0)).toBe(0)
      expect(layout.x(300)).toBe(innerWidth)
      expect(Number.isFinite(layout.x(10))).toBe(true)
      expect(layout.xTicks).toEqual([0, 1, 10, 100])
    })
  })

  describe('logTickValues', () => {
    it('logTickValues_NarrowDomain_FallsBackToDomainEnds', () => {
      expect(logTickValues([2, 5])).toEqual([2, 5])
    })
  })
})
