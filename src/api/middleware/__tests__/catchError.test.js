import { jest } from '@jest/globals'
import { catchErrorHandler } from '../catchError'

jest.unstable_mockModule('../../lib/logger', () => ({
  logger: jest.fn(() => ({
    error: jest.fn(),
  })),
}))

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

test('logs an error', async () => {
  await import('../../lib/logger')

  catchErrorHandler(new Error('Error'), {}, res, {})

  expect(res.status).toHaveBeenCalledTimes(1)
  expect(res.send).toHaveBeenCalledTimes(1)
})
