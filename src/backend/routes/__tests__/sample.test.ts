import { describe, it, expect, vi, beforeEach } from 'vitest'
import { get, post } from '../sample.js'
import { OK, CREATED, BAD_REQUEST } from '../../lib/status.js'
import type { Request, Response, NextFunction } from 'express'

describe('sample route', () => {
  describe('GET /api/sample', () => {
    it('should return array of sample items', async () => {
      const req = {} as Request
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      } as unknown as Response
      const next = vi.fn() as NextFunction

      await get(req, res, next)

      expect(res.status).toHaveBeenCalledWith(OK)
      expect(res.json).toHaveBeenCalledWith(expect.any(Array))
      expect(next).not.toHaveBeenCalled()
    })
  })

  describe('POST /api/sample', () => {
    it('should create a new item with valid data', async () => {
      const req = {
        body: {
          name: 'Test Item',
          value: 123,
        },
      } as Request
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      } as unknown as Response
      const next = vi.fn() as NextFunction

      await post(req, res, next)

      expect(res.status).toHaveBeenCalledWith(CREATED)
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          id: expect.any(Number),
          name: 'Test Item',
          value: 123,
        }),
      )
      expect(next).not.toHaveBeenCalled()
    })

    it('should return 400 if name is missing', async () => {
      const req = {
        body: {
          value: 123,
        },
      } as Request
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      } as unknown as Response
      const next = vi.fn() as NextFunction

      await post(req, res, next)

      expect(res.status).toHaveBeenCalledWith(BAD_REQUEST)
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Invalid input',
        }),
      )
    })

    it('should return 400 if value is missing', async () => {
      const req = {
        body: {
          name: 'Test',
        },
      } as Request
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      } as unknown as Response
      const next = vi.fn() as NextFunction

      await post(req, res, next)

      expect(res.status).toHaveBeenCalledWith(BAD_REQUEST)
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Invalid input',
        }),
      )
    })
  })
})
