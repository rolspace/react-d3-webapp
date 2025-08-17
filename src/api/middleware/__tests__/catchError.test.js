import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { catchErrorHandler } from '../catchError'

vi.mock('../../lib/logger', () => ({
  logger: {
    error: vi.fn(),
  },
}))

let res = {}

describe('catchErrorHandler', () => {
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

  it('logs an error', async () => {
    await import('../../lib/logger')

    catchErrorHandler(new Error('Error'), {}, res, {})

    expect(res.status).toHaveBeenCalledTimes(1)
    expect(res.send).toHaveBeenCalledTimes(1)
  })
})
