import { jest } from '@jest/globals'
import { rest } from 'msw'
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

const loggerModulePath = '../../lib/logger'

jest.unstable_mockModule(loggerModulePath, () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
  },
}))

test('token module responds with a 200 status code when the request for data is successful', async () => {
  const handlers = [
    rest.post('https://github.com/login/oauth/access_token', (req, res, context) => {
      return res(
        context.json({
          data: {
            access_token: 'abcdef123456',
          },
        }),
      )
    }),
  ]

  const server = setupServer(...handlers)
  server.listen()

  const req = {
    body: { code: 'code', state: 'state' },
  }

  await import(loggerModulePath)

  const { post } = await import('../token')

  await post(req, res, () => { })

  expect(res.send).toHaveBeenCalledTimes(1)
  expect(res.status).toHaveBeenCalledTimes(1)
  expect(res.status).toHaveBeenCalledWith(200)

  server.resetHandlers()
  server.close()
})
