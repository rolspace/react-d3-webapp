import { Request, Response, NextFunction } from 'express'
import { OK } from '../lib/status.js'

export const get = (req: Request, res: Response, next: NextFunction) => {
  try {
    res.status(OK).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    next(error)
  }
}
