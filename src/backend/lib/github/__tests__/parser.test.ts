import { describe, it, expect, vi } from 'vitest'
import { parseRepoEdges } from '../parser.js'
import { logger } from '../../logger.js'
import type { CommitEdge } from '../../../types/commit.js'

function makeEdge(additions: number, deletions: number, changedFiles: number): CommitEdge {
  return {
    node: {
      additions,
      deletions,
      changedFiles,
      pushedDate: null,
      oid: 'x',
      author: { user: { login: 'a' } },
    },
  }
}

describe('parseRepoEdges', () => {
  it('parseRepoEdges_AdditionsAndDeletionsRequested_ProduceIdenticalBoundariesWithDistinctCounts', () => {
    const edges = [
      makeEdge(1, 50, 1),
      makeEdge(5, 60, 1),
      makeEdge(10, 70, 1),
      makeEdge(100, 80, 1),
    ]

    const [result] = parseRepoEdges(edges, ['additions', 'deletions'])

    const boundaryOf = (series: typeof result.additions) =>
      series.map((r) => ({ min: r.min, max: r.max, label: r.label }))

    expect(boundaryOf(result.additions)).toEqual(boundaryOf(result.deletions))

    const additionsCounts = result.additions.map((r) => r.count)
    const deletionsCounts = result.deletions.map((r) => r.count)
    expect(additionsCounts).not.toEqual(deletionsCounts)
  })

  it('parseRepoEdges_ChangedFilesWithAdditionsAndDeletions_RemainsIndependent', () => {
    const edges = [
      makeEdge(1, 50, 500),
      makeEdge(5, 60, 600),
      makeEdge(10, 70, 700),
      makeEdge(100, 80, 800),
    ]

    const [result] = parseRepoEdges(edges, ['additions', 'deletions', 'changedFiles'])

    const changedFilesValues = edges.map((e) => e.node.changedFiles)
    const expectedMin = Math.min(...changedFilesValues)
    const expectedMax = Math.max(...changedFilesValues)

    expect(result.changedFiles[0].min).toBe(expectedMin)
    expect(result.changedFiles[result.changedFiles.length - 1].max).toBe(expectedMax)

    const additionsBoundary = { min: result.additions[0].min, max: result.additions[result.additions.length - 1].max }
    expect(additionsBoundary.min).not.toBe(expectedMin)
    expect(additionsBoundary.max).not.toBe(expectedMax)
  })

  it('parseRepoEdges_OnlyAdditionsRequested_RangesIndependently', () => {
    const edges = [makeEdge(1, 999, 1), makeEdge(5, 999, 1), makeEdge(10, 999, 1)]

    const [result] = parseRepoEdges(edges, ['additions'])

    expect(result.additions[0].min).toBe(1)
    expect(result.additions[result.additions.length - 1].max).toBe(10)
    expect(result.additions.reduce((sum, r) => sum + r.count, 0)).toBe(3)
  })

  it('parseRepoEdges_DeletionsEmptyAdditionsPopulated_WarnsAndReturnsEmptyForDeletions', () => {
    const warnSpy = vi.spyOn(logger, 'warn').mockImplementation(() => logger)
    const edges = [
      { node: { additions: 1, deletions: null, changedFiles: 1, pushedDate: null, oid: 'x', author: { user: { login: 'a' } } } },
      { node: { additions: 5, deletions: null, changedFiles: 1, pushedDate: null, oid: 'x', author: { user: { login: 'a' } } } },
    ] as unknown as CommitEdge[]

    const [result] = parseRepoEdges(edges, ['additions', 'deletions'])

    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('deletions'))
    expect(result.deletions).toEqual([])
    expect(result.additions.length).toBeGreaterThan(0)
    expect(result.additions[0].min).toBe(1)
    expect(result.additions[result.additions.length - 1].max).toBe(5)

    warnSpy.mockRestore()
  })

  it('parseRepoEdges_AdditionsAndDeletionsBothEmpty_WarnsForBothAndReturnsEmptyArrays', () => {
    const warnSpy = vi.spyOn(logger, 'warn').mockImplementation(() => logger)
    const edges = [
      { node: { additions: null, deletions: null, changedFiles: 1, pushedDate: null, oid: 'x', author: { user: { login: 'a' } } } },
    ] as unknown as CommitEdge[]

    const [result] = parseRepoEdges(edges, ['additions', 'deletions'])

    expect(warnSpy).toHaveBeenCalledTimes(2)
    expect(result.additions).toEqual([])
    expect(result.deletions).toEqual([])

    warnSpy.mockRestore()
  })

  it('parseRepoEdges_AllCombinedAdditionsDeletionsValuesEqual_UsesSingleBucketFallbackForBoth', () => {
    const N = 42
    const edges = [makeEdge(N, N, 1), makeEdge(N, N, 1), makeEdge(N, N, 1)]

    const [result] = parseRepoEdges(edges, ['additions', 'deletions'])

    expect(result.additions).toEqual([{ min: N, max: N, count: 3, label: `${N}-${N}` }])
    expect(result.deletions).toEqual([{ min: N, max: N, count: 3, label: `${N}-${N}` }])
  })

  it('parseRepoEdges_AdditionsValueOutsideOwnRangeButWithinSharedRange_ClampsIntoBoundaryBucket', () => {
    const additionsValues = [1, 2, 3, 10]
    const deletionsValues = [1, 1000]
    const edges = [
      ...additionsValues.map((a) => makeEdge(a, deletionsValues[0], 1)),
      makeEdge(additionsValues[0], deletionsValues[1], 1),
    ]

    const [result] = parseRepoEdges(edges, ['additions', 'deletions'])

    result.additions.forEach((_, i) => expect(i).toBeGreaterThanOrEqual(0))
    expect(result.additions.length).toBeLessThanOrEqual(20)
    const totalAdditionsCount = result.additions.reduce((sum, r) => sum + r.count, 0)
    expect(totalAdditionsCount).toBe(edges.length)
  })
})
