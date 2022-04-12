const rp = require('request-promise-native')
const logger = require('../../common/logger')
const queries = require('../../common/queries')
const repo = require('../repo')

let res = {}

describe('repo module', () => {
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

  test('responds with a 200 status code when the request for data is successful', async () => {
    const req = {
      params: { name: 'name', owner: 'owner' },
      body: { token: 'token' },
    }
    const data = {
      data: { repository: { ref: { target: { history: { edges: [] } } } } },
    }

    const queriesMock = jest
      .spyOn(queries, 'getQuery')
      .mockReturnValue({ data: 'repository(name: "%NAME%", owner: "%OWNER%")' })

    const requestPromiseMock = jest.spyOn(rp, 'post').mockResolvedValue(data)

    jest.spyOn(logger, 'info').mockImplementation(() => jest.fn())

    await repo.post(req, res)

    expect(queriesMock).toHaveBeenCalledTimes(1)
    expect(requestPromiseMock).toHaveBeenCalledTimes(1)
    expect(res.send).toHaveBeenCalledTimes(1)
    expect(res.status).toHaveBeenCalledTimes(1)
    expect(res.status).toHaveBeenCalledWith(200)
  })

  test('calls the next handler if the name parameter is not in the request body', async () => {
    const req = { params: { owner: 'owner' }, body: { token: 'token' } }

    const queriesMock = jest
      .spyOn(queries, 'getQuery')
      .mockReturnValue({ data: 'repository(name: "%NAME%", owner: "%OWNER%")' })

    const nextMock = jest.fn()

    await repo.post(req, res, nextMock)

    expect(queriesMock).toHaveBeenCalledTimes(1)
    expect(nextMock).toHaveBeenCalledTimes(1)
  })

  test('calls the next handler, if there an error retrieving the external data', async () => {
    const req = {
      params: { name: 'name', owner: 'owner' },
      body: { token: 'token' },
    }

    const queriesMock = jest
      .spyOn(queries, 'getQuery')
      .mockReturnValue({ data: 'repository(name: "%NAME%", owner: "%OWNER%")' })

    const requestPromiseMock = jest.spyOn(rp, 'post').mockRejectedValue('error')

    const nextMock = jest.fn()

    await repo.post(req, res, nextMock)

    expect(queriesMock).toHaveBeenCalledTimes(1)
    expect(requestPromiseMock).toHaveBeenCalledTimes(1)
    expect(nextMock).toHaveBeenCalledTimes(1)
  })
})
