import { describe, it, expect, vi } from 'vitest'
import { get } from '../health.js'
import { OK } from '../../lib/status.js'
import type { Request, Response, NextFunction } from 'express'

describe('health route', () => {
  it('should return status ok with timestamp', () => {
    const req = {} as Request
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as Response
    const next = vi.fn() as NextFunction

    get(req, res, next)

    expect(res.status).toHaveBeenCalledWith(OK)
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'ok',
        timestamp: expect.any(String),
      }),
    )
    expect(next).not.toHaveBeenCalled()
  })
})
