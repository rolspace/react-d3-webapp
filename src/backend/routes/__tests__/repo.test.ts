import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import type { NextFunction, Request, Response } from 'express'
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { get } from '../repo.js'
import { OK, UNAUTHORIZED } from '../../lib/status.js'

const GITHUB_GRAPHQL_URL = 'https://api.github.com/graphql'

const server = setupServer()

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

function makeReq(session: Record<string, unknown> = { accessToken: 'token' }): Request {
  return { params: { owner: 'o', repo: 'r' }, session } as unknown as Request
}

function makeRes() {
  return {
    status: vi.fn().mockReturnThis(),
    json: vi.fn(),
  }
}

describe('GET /api/repo/:owner/:repo', () => {
  it('get_GraphqlReturnsCommits_RespondsWithCommitsAndHasNextPage', async () => {
    let capturedQuery: string | undefined
    let capturedAuth: string | null = null
    server.use(
      http.post(GITHUB_GRAPHQL_URL, async ({ request }) => {
        const { query } = (await request.json()) as { query: string }
        capturedQuery = query
        capturedAuth = request.headers.get('authorization')
        return HttpResponse.json({
          data: {
            repository: {
              ref: {
                target: {
                  id: '1',
                  history: {
                    pageInfo: { hasNextPage: true },
                    edges: [
                      {
                        node: {
                          oid: 'c2',
                          committedDate: '2026-01-02T00:00:00Z',
                          additions: 5,
                          deletions: 2,
                          changedFiles: 1,
                          author: { user: { login: 'octocat' } },
                        },
                      },
                      {
                        node: {
                          oid: 'c1',
                          committedDate: '2026-01-01T00:00:00Z',
                          additions: 3,
                          deletions: 0,
                          changedFiles: 2,
                          author: { user: null },
                        },
                      },
                    ],
                  },
                },
              },
            },
          },
        })
      }),
    )

    const res = makeRes()
    const next = vi.fn() as NextFunction
    await get(makeReq(), res as unknown as Response, next)

    expect(res.status).toHaveBeenCalledWith(OK)
    expect(res.json).toHaveBeenCalledWith({
      commits: [
        { oid: 'c2', date: '2026-01-02T00:00:00Z', additions: 5, deletions: 2, changedFiles: 1, author: 'octocat' },
        { oid: 'c1', date: '2026-01-01T00:00:00Z', additions: 3, deletions: 0, changedFiles: 2, author: null },
      ],
      hasNextPage: true,
    })
    expect(capturedQuery).toContain('committedDate')
    expect(capturedQuery).not.toContain('pushedDate')
    expect(capturedAuth).toBe('Bearer token')
    expect(next).not.toHaveBeenCalled()
  })

  it('get_NoAccessToken_Responds401AndSkipsGraphql', async () => {
    let called = false
    server.use(
      http.post(GITHUB_GRAPHQL_URL, () => {
        called = true
        return HttpResponse.json({ data: {} })
      }),
    )

    const res = makeRes()
    const next = vi.fn() as NextFunction
    await get(makeReq({}), res as unknown as Response, next)

    expect(res.status).toHaveBeenCalledWith(UNAUTHORIZED)
    expect(res.json).toHaveBeenCalledWith({ error: 'Unauthorized' })
    expect(called).toBe(false)
  })

  it('get_EmptyHistoryEdges_Responds200WithEmptyCommits', async () => {
    server.use(
      http.post(GITHUB_GRAPHQL_URL, () =>
        HttpResponse.json({
          data: {
            repository: {
              ref: { target: { id: '1', history: { pageInfo: { hasNextPage: false }, edges: [] } } },
            },
          },
        }),
      ),
    )

    const res = makeRes()
    const next = vi.fn() as NextFunction
    await get(makeReq(), res as unknown as Response, next)

    expect(res.status).toHaveBeenCalledWith(OK)
    expect(res.json).toHaveBeenCalledWith({ commits: [], hasNextPage: false })
    expect(next).not.toHaveBeenCalled()
  })

  it('get_NullRef_Responds200WithEmptyCommits', async () => {
    server.use(
      http.post(GITHUB_GRAPHQL_URL, () =>
        HttpResponse.json({ data: { repository: { ref: null } } }),
      ),
    )

    const res = makeRes()
    const next = vi.fn() as NextFunction
    await get(makeReq(), res as unknown as Response, next)

    expect(res.status).toHaveBeenCalledWith(OK)
    expect(res.json).toHaveBeenCalledWith({ commits: [], hasNextPage: false })
    expect(next).not.toHaveBeenCalled()
  })

  it('get_GraphqlErrors_PassesErrorToNext', async () => {
    server.use(
      http.post(GITHUB_GRAPHQL_URL, () =>
        HttpResponse.json({
          data: { repository: null },
          errors: [{ type: 'NOT_FOUND', message: 'Could not resolve to a Repository' }],
        }),
      ),
    )

    const res = makeRes()
    const next = vi.fn() as NextFunction
    await get(makeReq(), res as unknown as Response, next)

    expect(next).toHaveBeenCalledTimes(1)
    expect(next).toHaveBeenCalledWith(expect.any(Error))
    expect(res.json).not.toHaveBeenCalled()
  })
})
