import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('../../lib/queries', () => ({
  getQuery: vi.fn().mockReturnValue({
    text: 'repository(name: "%NAME%", owner: "%OWNER%")',
  }),
}))

let res = {}
const queriesModulePath = '../../lib/queries'

describe('repo module', () => {
  beforeEach(() => {
    res = {
      send: vi.fn().mockReturnThis(),
      status: vi.fn().mockReturnThis(),
    }
  })

  afterEach(() => {
    vi.restoreAllMocks()
    res = {}
  })

  it('responds with a 200 status code when the request for data is successful', async () => {
    const handlers = [
      http.post('https://api.github.com/graphql', (req, res, context) => {
        return HttpResponse.json({
          data: {
            repository: { ref: { target: { history: { edges: [] } } } },
          },
        })
      }),
    ]

    const server = setupServer(...handlers)
    server.listen()

    const req = {
      params: { name: 'name', owner: 'owner' },
      body: { token: 'token' },
    }

    await import(queriesModulePath)
    const { post } = await import('../repo')
    await post(req, res, () => {})

    expect(res.send).toHaveBeenCalledTimes(1)
    expect(res.status).toHaveBeenCalledTimes(1)
    expect(res.status).toHaveBeenCalledWith(200)

    server.resetHandlers()
    server.close()
  })

  it('responds with a 404 status code if the name path parameter is not included', async () => {
    const req = { params: { owner: 'owner' }, body: { token: 'token' } }

    await import(queriesModulePath)
    const { post } = await import('../repo')
    await post(req, res, () => {})

    expect(res.status).toHaveBeenCalledTimes(1)
    expect(res.status).toHaveBeenCalledWith(404)
  })

  it('responds with a 404 status code if the owner path parameter are not included', async () => {
    const req = { params: { name: 'name' }, body: { token: 'token' } }

    await import(queriesModulePath)
    const { post } = await import('../repo')
    await post(req, res, () => {})

    expect(res.status).toHaveBeenCalledTimes(1)
    expect(res.status).toHaveBeenCalledWith(404)
  })

  it('responds with a 422 status code if the token is not included', async () => {
    const req = { params: { name: 'name', owner: 'owner' }, body: {} }

    await import(queriesModulePath)
    const { post } = await import('../repo')
    await post(req, res, () => {})

    expect(res.send).toHaveBeenCalledTimes(1)
    expect(res.status).toHaveBeenCalledTimes(1)
    expect(res.status).toHaveBeenCalledWith(422)
  })

  it('calls the next handler, if there is an error retrieving the external data', async () => {
    const handlers = [
      http.post('https://api.github.com/graphql', () => {
        throw new Error('Request failed')
      }),
    ]

    const server = setupServer(...handlers)
    server.listen()

    const req = {
      params: { name: 'name', owner: 'owner' },
      body: { token: 'token' },
    }

    await import(queriesModulePath)
    const { post } = await import('../repo')
    const mockNextHandler = vi.fn()
    await post(req, res, mockNextHandler)

    expect(mockNextHandler).toHaveBeenCalledTimes(1)

    server.resetHandlers()
    server.close()
  })
})
