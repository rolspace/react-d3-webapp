import { describe, it, expect, vi } from 'vitest'
import { requestLogger } from '../requestLogger.js'
import type { Request, Response, NextFunction } from 'express'

describe('requestLogger middleware', () => {
  it('should call next function', () => {
    const req = {
      method: 'GET',
      path: '/api/test',
    } as Request
    const res = {} as Response
    const next = vi.fn() as NextFunction

    requestLogger(req, res, next)

    expect(next).toHaveBeenCalled()
  })
})
