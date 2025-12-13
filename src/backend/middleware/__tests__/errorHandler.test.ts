import { describe, it, expect, vi } from 'vitest'
import { errorHandler } from '../errorHandler.js'
import { INTERNAL_SERVER_ERROR } from '../../lib/status.js'
import type { Request, Response, NextFunction } from 'express'

describe('errorHandler middleware', () => {
  it('should handle errors and return 500 status', () => {
    const error = new Error('Test error')
    const req = {} as Request
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as Response
    const next = vi.fn() as NextFunction

    errorHandler(error, req, res, next)

    expect(res.status).toHaveBeenCalledWith(INTERNAL_SERVER_ERROR)
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: 'Internal Server Error',
        message: 'Test error',
      }),
    )
  })
})
