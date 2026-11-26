import { describe, it, expect } from 'vitest'
import { toCommitRow, toRepoCommitsResponse } from '../commits.js'
import type { CommitEdge, CommitHistory } from '../../../types/commit.js'

function makeEdge(overrides: Partial<CommitEdge['node']> = {}): CommitEdge {
  return {
    node: {
      oid: 'x',
      committedDate: '2026-01-01T00:00:00Z',
      additions: 1,
      deletions: 1,
      changedFiles: 1,
      author: { user: { login: 'octocat' } },
      ...overrides,
    },
  }
}

describe('toCommitRow', () => {
  it('toCommitRow_FullCommit_ReturnsAllSixFields', () => {
    const edge = makeEdge({
      oid: 'abc',
      committedDate: '2026-01-02T03:04:05Z',
      additions: 10,
      deletions: 4,
      changedFiles: 2,
      author: { user: { login: 'octocat' } },
    })

    expect(toCommitRow(edge)).toEqual({
      oid: 'abc',
      date: '2026-01-02T03:04:05Z',
      additions: 10,
      deletions: 4,
      changedFiles: 2,
      author: 'octocat',
    })
  })

  it('toCommitRow_NullAuthorUser_ReturnsNullAuthor', () => {
    const row = toCommitRow(makeEdge({ author: { user: null } }))

    expect(row.author).toBeNull()
  })

  it('toCommitRow_NullAuthor_ReturnsNullAuthor', () => {
    const row = toCommitRow(makeEdge({ author: null }))

    expect(row.author).toBeNull()
  })

  it('toCommitRow_NullCommittedDate_ReturnsNullDate', () => {
    const row = toCommitRow(makeEdge({ committedDate: null }))

    expect(row.date).toBeNull()
    expect('date' in row).toBe(true)
  })

  it('toCommitRow_ExtraNodeFields_AreNotForwarded', () => {
    const edge = {
      node: { ...makeEdge().node, email: 'x@y.z', id: 'node-id' },
    } as unknown as CommitEdge

    const row = toCommitRow(edge)

    expect(Object.keys(row).sort()).toEqual(['additions', 'author', 'changedFiles', 'date', 'deletions', 'oid'])
  })
})

describe('toRepoCommitsResponse', () => {
  it('toRepoCommitsResponse_MultipleEdges_PreservesInputOrder', () => {
    const history: CommitHistory = {
      pageInfo: { hasNextPage: true },
      edges: [makeEdge({ oid: 'c3' }), makeEdge({ oid: 'c2' }), makeEdge({ oid: 'c1' })],
    }

    const response = toRepoCommitsResponse(history)

    expect(response.commits.map((c) => c.oid)).toEqual(['c3', 'c2', 'c1'])
    expect(response.hasNextPage).toBe(true)
  })

  it('toRepoCommitsResponse_EmptyEdges_ReturnsEmptyCommits', () => {
    const response = toRepoCommitsResponse({ pageInfo: { hasNextPage: false }, edges: [] })

    expect(response).toEqual({ commits: [], hasNextPage: false })
  })

  it('toRepoCommitsResponse_NullHistory_ReturnsEmptyCommits', () => {
    expect(toRepoCommitsResponse(undefined)).toEqual({ commits: [], hasNextPage: false })
    expect(toRepoCommitsResponse(null)).toEqual({ commits: [], hasNextPage: false })
  })
})
