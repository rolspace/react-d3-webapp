import { describe, expect, it } from 'vitest'
import { WeekBucket } from '../../utils/weekly'
import {
  createWeeklyLayout,
  MAX_BAR_WIDTH,
  MIN_CHART_WIDTH,
  NARROW_CHART_HEIGHT,
  weekTickValues,
} from '../weeklyChart'
import { CHART_HEIGHT, CHART_MARGINS } from '../chartScaffold'

const weeksOf = (counts: number[]): WeekBucket[] => {
  const start = new Date('2024-01-08T00:00:00Z').getTime()
  return counts.map((count, i) => ({ weekStart: new Date(start + i * 7 * 24 * 3600 * 1000), count }))
}

describe('createWeeklyLayout', () => {
  it('createWeeklyLayout_NoWeeks_ReturnsNull', () => {
    expect(createWeeklyLayout([], 800)).toBeNull()
  })

  it('createWeeklyLayout_Weeks_YDomainStartsAtZeroWithIntegerTicks', () => {
    const layout = createWeeklyLayout(weeksOf([3, 0, 7]), 800)!

    expect(layout.y.domain()[0]).toBe(0)
    expect(layout.y.domain()[1]).toBeGreaterThanOrEqual(7)
    expect(layout.yTicks.every(Number.isInteger)).toBe(true)
    expect(layout.yTicks).toContain(0)
  })

  it('createWeeklyLayout_Weeks_SlotsTileXRange', () => {
    const weeks = weeksOf([1, 2, 3, 4])
    const layout = createWeeklyLayout(weeks, 800)!

    expect(layout.slotWidth).toBeCloseTo(layout.innerWidth / 4)
    expect(layout.x(weeks[2].weekStart)).toBeCloseTo(2 * layout.slotWidth)
  })

  it('createWeeklyLayout_SingleWeek_CapsBarWidth', () => {
    const layout = createWeeklyLayout(weeksOf([5]), 800)!

    expect(layout.slotWidth).toBe(layout.innerWidth)
    expect(layout.barWidth).toBe(MAX_BAR_WIDTH)
  })

  it('createWeeklyLayout_NarrowWidth_UsesNarrowHeightAndFewerTicks', () => {
    const weeks = weeksOf(Array(20).fill(1))
    const narrow = createWeeklyLayout(weeks, 360)!
    const wide = createWeeklyLayout(weeks, 800)!

    expect(narrow.height).toBe(NARROW_CHART_HEIGHT)
    expect(narrow.xTicks.length).toBeLessThanOrEqual(3)
    expect(wide.height).toBe(CHART_HEIGHT)
    expect(wide.xTicks.length).toBeGreaterThan(narrow.xTicks.length)
    expect(wide.xTicks.length).toBeLessThanOrEqual(9)
  })

  it('createWeeklyLayout_BelowMinWidth_ClampsToMinChartWidth', () => {
    expect(createWeeklyLayout(weeksOf([1]), 100)!.width).toBe(MIN_CHART_WIDTH)
  })

  it('createWeeklyLayout_InnerWidth_MatchesMargins', () => {
    const layout = createWeeklyLayout(weeksOf([1, 2]), 800)!

    expect(layout.innerWidth).toBe(800 - CHART_MARGINS.left - CHART_MARGINS.right)
  })
})

describe('weekTickValues', () => {
  it('weekTickValues_FewWeeks_KeepsAllWeeks', () => {
    const three = weeksOf([1, 1, 1]).map((w) => w.weekStart)
    const thirty = weeksOf(Array(30).fill(1)).map((w) => w.weekStart)

    expect(weekTickValues(three, 720)).toEqual(three)

    const thinned = weekTickValues(thirty, 280)
    expect(thinned[0]).toEqual(thirty[0])
    expect(thinned.length).toBeLessThanOrEqual(3)
  })
})
