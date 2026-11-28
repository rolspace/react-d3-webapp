import { describe, expect, it } from 'vitest'
import { CommitRow } from '../../types/commit.types'
import {
  buildCommitUrl,
  computeCommitSummary,
  computeQuantiles,
  computeTotals,
  shortOid,
  topCommitsBySize,
} from '../summaryStats'

const row = (oid: string, additions: number, deletions: number, changedFiles = 1, author: string | null = 'a'): CommitRow => ({
  oid, date: '2024-01-08T10:00:00Z', additions, deletions, changedFiles, author,
})

const HEX40 = 'a'.repeat(40)

describe('computeTotals', () => {
  it('computeTotals_Rows_SumsAdditionsDeletionsAndNetLines', () => {
    const rows = [row('a', 1000, 10), row('b', 234, 20), row('c', 0, 4)]

    expect(computeTotals(rows)).toEqual({ commitCount: 3, additions: 1234, deletions: 34, netLines: 1200 })
  })

  it('computeTotals_DeletionsExceedAdditions_ReturnsNegativeNetLines', () => {
    expect(computeTotals([row('a', 5, 50)]).netLines).toBe(-45)
  })

  it('computeTotals_MissingNumericValues_CountsThemAsZero', () => {
    const rows = [
      { ...row('a', 3, 1), additions: null as unknown as number },
      { ...row('b', 4, 1), deletions: NaN },
      row('c', 5, 2),
    ]

    // Additions: 0 (null) + 4 + 5. Deletions: 1 + 0 (NaN) + 2.
    expect(computeTotals(rows)).toMatchObject({ commitCount: 3, additions: 9, deletions: 3 })
  })

  it('computeTotals_NoCommits_ReturnsZeros', () => {
    expect(computeTotals([])).toEqual({ commitCount: 0, additions: 0, deletions: 0, netLines: 0 })
  })
})

describe('computeQuantiles', () => {
  it('computeQuantiles_OddCount_ReturnsMiddleValueAndInterpolatedP90', () => {
    const q = computeQuantiles([5, 1, 4, 2, 3])

    expect(q.median).toBe(3)
    expect(q.p90).toBeCloseTo(4.6)
  })

  it('computeQuantiles_EvenCount_InterpolatesMedianAndP90', () => {
    const q = computeQuantiles([10, 20, 30, 40])

    expect(q.median).toBe(25)
    expect(q.p90).toBeCloseTo(37)
  })

  it('computeQuantiles_SingleValue_ReturnsThatValueForBoth', () => {
    expect(computeQuantiles([42])).toEqual({ median: 42, p90: 42 })
  })

  it('computeQuantiles_Empty_ReturnsNulls', () => {
    expect(computeQuantiles([])).toEqual({ median: null, p90: null })
    expect(computeQuantiles([null, undefined, NaN, Infinity, '7'])).toEqual({ median: null, p90: null })
  })

  it('computeQuantiles_MixedValues_IgnoresNonFiniteValues', () => {
    expect(computeQuantiles([null, 4, NaN, 8, 'x']).median).toBe(6)
  })
})

describe('topCommitsBySize', () => {
  it('topCommitsBySize_MoreThanTenCommits_ReturnsTenLargestDescending', () => {
    const sizes = [7, 1, 12, 3, 9, 5, 11, 2, 8, 4, 10, 6]
    const rows = sizes.map((s, i) => row(`oid${i}`, s, 0))

    const top = topCommitsBySize(rows)

    expect(top).toHaveLength(10)
    expect(top.map((c) => c.size)).toEqual([12, 11, 10, 9, 8, 7, 6, 5, 4, 3])
    for (const c of top) {
      expect(c.size).toBe((c.additions ?? 0) + (c.deletions ?? 0))
    }
  })

  it('topCommitsBySize_TiedSizes_KeepsResponseOrder', () => {
    const rows = [row('a', 5, 5), row('b', 1, 0), row('c', 10, 0), row('d', 0, 10)]

    const first = topCommitsBySize(rows).map((c) => c.oid)
    const second = topCommitsBySize(rows).map((c) => c.oid)

    expect(first).toEqual(['a', 'c', 'd', 'b'])
    expect(second).toEqual(first)
  })

  it('topCommitsBySize_FewerThanTenCommits_ReturnsAll', () => {
    expect(topCommitsBySize([row('a', 1, 1), row('b', 2, 2), row('c', 3, 3)])).toHaveLength(3)
  })

  it('topCommitsBySize_NullOrBlankAuthor_ReturnsUnknown', () => {
    const top = topCommitsBySize([row('a', 1, 1, 1, null), row('b', 2, 2, 1, '  '), row('c', 3, 3, 1, 'octocat')])

    expect(top.find((c) => c.oid === 'a')?.author).toBe('Unknown')
    expect(top.find((c) => c.oid === 'b')?.author).toBe('Unknown')
    expect(top.find((c) => c.oid === 'c')?.author).toBe('octocat')
  })

  it('topCommitsBySize_MissingMetric_ReturnsNullValueAndCountsZeroInSize', () => {
    const [commit] = topCommitsBySize([{ ...row('a', 7, 0), deletions: null as unknown as number }])

    expect(commit.deletions).toBeNull()
    expect(commit.size).toBe(7)
  })
})

describe('shortOid', () => {
  it('shortOid_FullOid_ReturnsFirstSevenCharacters', () => {
    expect(shortOid('0123456789abcdef'.repeat(2).slice(0, 40))).toBe('0123456')
    expect(shortOid('abc')).toBe('abc')
    expect(shortOid(null)).toBe('')
  })
})

describe('buildCommitUrl', () => {
  it('buildCommitUrl_ValidSegments_ReturnsGithubCommitUrl', () => {
    expect(buildCommitUrl('facebook', 'react', 'a1b2c3d4e5'))
      .toBe('https://github.com/facebook/react/commit/a1b2c3d4e5')
    expect(buildCommitUrl('my-org', 'repo.js_v2', HEX40))
      .toBe(`https://github.com/my-org/repo.js_v2/commit/${HEX40}`)
  })

  it('buildCommitUrl_InvalidSegment_ReturnsNull', () => {
    expect(buildCommitUrl('a/b', 'react', 'a1b2c3d')).toBeNull()
    expect(buildCommitUrl('', 'react', 'a1b2c3d')).toBeNull()
    expect(buildCommitUrl('evil.com?', 'react', 'a1b2c3d')).toBeNull()
    expect(buildCommitUrl('facebook', '..', 'a1b2c3d')).toBeNull()
    expect(buildCommitUrl('facebook', 're po', 'a1b2c3d')).toBeNull()
    expect(buildCommitUrl('facebook', 'react', 'not-a-sha')).toBeNull()
  })
})

describe('computeCommitSummary', () => {
  it('computeCommitSummary_100Commits_ComputesUnder10ms', () => {
    // Deterministic pseudo-random sizes so the test is repeatable.
    const rows = Array.from({ length: 100 }, (_, i) =>
      row(`${i.toString(16).padStart(40, '0')}`, (i * 37) % 501, (i * 91) % 263, (i * 7) % 19))

    computeCommitSummary(rows) // warm up
    const start = performance.now()
    const summary = computeCommitSummary(rows)
    const elapsed = performance.now() - start

    expect(elapsed).toBeLessThan(10)
    expect(summary.largest).toHaveLength(10)
    for (const metric of ['additions', 'deletions', 'changedFiles'] as const) {
      expect(summary.quantiles[metric].median).not.toBeNull()
      expect(summary.quantiles[metric].p90).not.toBeNull()
    }
  })
})
