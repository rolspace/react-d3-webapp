import { jest } from '@jest/globals'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

let res = {}

beforeEach(() => {
  res = {
    send: jest.fn().mockReturnThis(),
    status: jest.fn().mockReturnThis(),
  }
})

afterEach(() => {
  jest.restoreAllMocks()

  res = {}
})

const queriesModulePath = '../../lib/queries'

jest.unstable_mockModule(queriesModulePath, () => ({
  getQuery: jest.fn().mockReturnValue({
    text: 'repository(name: "%NAME%", owner: "%OWNER%")',
  }),
}))

test('repo module responds with a 200 status code when the request for data is successful', async () => {
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

test('repo module responds with a 404 status code if the name path parameter is not included', async () => {
  const req = { params: { owner: 'owner' }, body: { token: 'token' } }

  await import(queriesModulePath)

  const { post } = await import('../repo')

  await post(req, res, () => {})

  expect(res.status).toHaveBeenCalledTimes(1)
  expect(res.status).toHaveBeenCalledWith(404)
})

test('repo module responds with a 404 status code if the owner path parameter are not included', async () => {
  const req = { params: { name: 'name' }, body: { token: 'token' } }

  await import(queriesModulePath)

  const { post } = await import('../repo')

  await post(req, res, () => {})

  expect(res.status).toHaveBeenCalledTimes(1)
  expect(res.status).toHaveBeenCalledWith(404)
})

test('repo module responds with a 422 status code if the token is not included', async () => {
  const req = { params: { name: 'name', owner: 'owner' }, body: {} }

  await import(queriesModulePath)

  const { post } = await import('../repo')

  await post(req, res, () => {})

  expect(res.send).toHaveBeenCalledTimes(1)
  expect(res.status).toHaveBeenCalledTimes(1)
  expect(res.status).toHaveBeenCalledWith(422)
})

test('repo module calls the next handler, if there is an error retrieving the external data', async () => {
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

  const mockNextHandler = jest.fn()
  await post(req, res, mockNextHandler)

  expect(mockNextHandler).toHaveBeenCalledTimes(1)

  server.resetHandlers()
  server.close()
})
