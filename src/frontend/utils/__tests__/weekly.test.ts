import { describe, expect, it } from 'vitest'
import { groupCommitsByWeek, parseCommitDate } from '../weekly'

const at = (date: string | null) => ({ date })

describe('groupCommitsByWeek', () => {
  it('groupCommitsByWeek_CommitsInSameWeek_ReturnsOneBucketWithCount', () => {
    const result = groupCommitsByWeek([
      at('2024-01-08T10:00:00Z'),
      at('2024-01-10T12:00:00Z'),
      at('2024-01-14T23:59:59Z'),
    ])

    expect(result.weeks).toEqual([{ weekStart: new Date('2024-01-08T00:00:00Z'), count: 3 }])
    expect(result.datedCount).toBe(3)
    expect(result.excludedCount).toBe(0)
  })

  it('groupCommitsByWeek_GapWeeks_FillsMissingWeeksWithZero', () => {
    const result = groupCommitsByWeek([
      at('2024-01-08T10:00:00Z'),
      at('2024-01-29T10:00:00Z'),
    ])

    expect(result.weeks.map((w) => w.weekStart.toISOString())).toEqual([
      '2024-01-08T00:00:00.000Z',
      '2024-01-15T00:00:00.000Z',
      '2024-01-22T00:00:00.000Z',
      '2024-01-29T00:00:00.000Z',
    ])
    expect(result.weeks.map((w) => w.count)).toEqual([1, 0, 0, 1])
  })

  it('groupCommitsByWeek_NullAndInvalidDates_ExcludesAndCountsThem', () => {
    const result = groupCommitsByWeek([
      at('2024-01-08T10:00:00Z'),
      at(null),
      at('not a date'),
      at(''),
      at('2024-13-45T00:00:00Z'),
    ])

    expect(result.datedCount).toBe(1)
    expect(result.excludedCount).toBe(4)
    expect(result.weeks).toHaveLength(1)
    expect(result.weeks[0].count).toBe(1)
  })

  it('groupCommitsByWeek_SundayMondayBoundaryUtc_SplitsIntoTwoWeeks', () => {
    const result = groupCommitsByWeek([
      at('2024-01-14T23:59:59.999Z'),
      at('2024-01-15T00:00:00Z'),
      // 00:30 on Monday in +01:00 is 23:30 on Sunday UTC, so it belongs to the earlier week.
      at('2024-01-15T00:30:00+01:00'),
    ])

    expect(result.weeks).toEqual([
      { weekStart: new Date('2024-01-08T00:00:00Z'), count: 2 },
      { weekStart: new Date('2024-01-15T00:00:00Z'), count: 1 },
    ])
  })

  it('groupCommitsByWeek_SingleWeek_ReturnsSingleBucketAndRange', () => {
    const date = '2024-03-06T08:00:00Z'

    const result = groupCommitsByWeek([at(date)])

    expect(result.weeks).toHaveLength(1)
    expect(result.weeks[0].weekStart.toISOString()).toBe('2024-03-04T00:00:00.000Z')
    expect(result.firstDate).toEqual(new Date(date))
    expect(result.lastDate).toEqual(new Date(date))
  })

  it('groupCommitsByWeek_EmptyInput_ReturnsEmptyResult', () => {
    expect(groupCommitsByWeek([])).toEqual({
      weeks: [],
      datedCount: 0,
      excludedCount: 0,
      firstDate: null,
      lastDate: null,
    })
  })

  it('groupCommitsByWeek_AllDatesInvalid_ReturnsNoWeeksWithExcludedCount', () => {
    const result = groupCommitsByWeek([at(null), at('x')])

    expect(result.weeks).toEqual([])
    expect(result.excludedCount).toBe(2)
    expect(result.firstDate).toBeNull()
  })

  it('groupCommitsByWeek_UnsortedInput_ReturnsAscendingWeeksAndExtent', () => {
    const result = groupCommitsByWeek([
      at('2024-02-05T00:00:00Z'),
      at('2024-01-08T00:00:00Z'),
      at('2024-01-22T00:00:00Z'),
    ])

    expect(result.weeks[0].weekStart.toISOString()).toBe('2024-01-08T00:00:00.000Z')
    expect(result.weeks[result.weeks.length - 1].weekStart.toISOString()).toBe('2024-02-05T00:00:00.000Z')
    expect(result.weeks.reduce((sum, w) => sum + w.count, 0)).toBe(3)
    expect(result.firstDate).toEqual(new Date('2024-01-08T00:00:00Z'))
    expect(result.lastDate).toEqual(new Date('2024-02-05T00:00:00Z'))
  })
})

describe('parseCommitDate', () => {
  it('parseCommitDate_NonStringOrBlank_ReturnsNull', () => {
    expect(parseCommitDate(undefined)).toBeNull()
    expect(parseCommitDate(42)).toBeNull()
    expect(parseCommitDate('   ')).toBeNull()
    expect(parseCommitDate('2024-01-08T00:00:00Z')?.toISOString()).toBe('2024-01-08T00:00:00.000Z')
  })
})
