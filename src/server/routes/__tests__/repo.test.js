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

test('repo module responds with a 200 status code when the request for data is successful', async () => {
  const handlers = [
    rest.post('https://api.github.com/graphql', (req, res, context) => {
      return res(
        context.json({
          data: {
            repository: { ref: { target: { history: { edges: [] } } } },
          },
        }),
      )
    }),
  ]

  const server = setupServer(...handlers)
  server.listen()

  const req = {
    params: { name: 'name', owner: 'owner' },
    body: { token: 'token' },
  }

  jest.unstable_mockModule('../../common/logger', () => ({
    logger: {
      info: jest.fn(),
    },
  }))

  await import('../../common/logger')

  jest.unstable_mockModule('../../common/queries', () => ({
    getQuery: jest.fn().mockReturnValue({
      text: 'repository(name: "%NAME%", owner: "%OWNER%")',
    }),
  }))
  await import('../../common/queries')

  const { post } = await import('../repo')

  await post(req, res, () => {})

  expect(res.send).toHaveBeenCalledTimes(1)
  expect(res.status).toHaveBeenCalledTimes(1)
  expect(res.status).toHaveBeenCalledWith(200)
})

// test('repo module calls the next handler if the name parameter is not in the request body', async () => {
//   const req = { params: { owner: 'owner' }, body: { token: 'token' } }

//   const queriesMock = jest
//     .spyOn(queries, 'getQuery')
//     .mockReturnValue({ data: 'repository(name: "%NAME%", owner: "%OWNER%")' })

//   const nextMock = jest.fn()

//   await repo.post(req, res, nextMock)

//   expect(queriesMock).toHaveBeenCalledTimes(1)
//   expect(nextMock).toHaveBeenCalledTimes(1)
// })

// test('repo module calls the next handler, if there an error retrieving the external data', async () => {
//   const req = {
//     params: { name: 'name', owner: 'owner' },
//     body: { token: 'token' },
//   }

//   const queriesMock = jest
//     .spyOn(queries, 'getQuery')
//     .mockReturnValue({ data: 'repository(name: "%NAME%", owner: "%OWNER%")' })

//   const requestPromiseMock = jest.spyOn(rp, 'post').mockRejectedValue('error')

//   const nextMock = jest.fn()

//   await repo.post(req, res, nextMock)

//   expect(queriesMock).toHaveBeenCalledTimes(1)
//   expect(requestPromiseMock).toHaveBeenCalledTimes(1)
//   expect(nextMock).toHaveBeenCalledTimes(1)
// })
