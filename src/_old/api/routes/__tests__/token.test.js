import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

let res = {}

describe('token module', () => {
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
      http.post('https://github.com/login/oauth/access_token', () => {
        return HttpResponse.json({
          data: {
            access_token: 'abcdef123456',
          },
        })
      }),
    ]

    const server = setupServer(...handlers)
    server.listen()

    const req = {
      body: { code: 'code', state: 'state' },
    }

    const { post } = await import('../token')

    await post(req, res, () => {})

    expect(res.send).toHaveBeenCalledTimes(1)
    expect(res.status).toHaveBeenCalledTimes(1)
    expect(res.status).toHaveBeenCalledWith(200)

    server.resetHandlers()
    server.close()
  })

  it('responds with a 400 status code if the "code" or "state" query string parameters are not included', async () => {
    const req = { params: { name: 'name', owner: 'owner' }, body: {} }

    const { post } = await import('../token')

    await post(req, res, () => {})

    expect(res.send).toHaveBeenCalledTimes(1)
    expect(res.status).toHaveBeenCalledTimes(1)
    expect(res.status).toHaveBeenCalledWith(400)
  })

  it('calls the next handler, if there is an error retrieving the external data', async () => {
    const handlers = [
      http.post('https://github.com/login/oauth/access_token', () => {
        throw new Error('Request failed')
      }),
    ]

    const server = setupServer(...handlers)
    server.listen()

    const req = {
      body: { code: 'code', state: 'state' },
    }

    const { post } = await import('../token')

    const mockNextHandler = vi.fn()
    await post(req, res, mockNextHandler)

    expect(mockNextHandler).toHaveBeenCalledTimes(1)

    server.resetHandlers()
    server.close()
  })
})
