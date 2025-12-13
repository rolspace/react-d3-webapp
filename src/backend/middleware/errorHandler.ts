import { Request, Response, NextFunction } from 'express'
import { logger } from '../lib/logger.js'
import { INTERNAL_SERVER_ERROR } from '../lib/status.js'

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  logger.error(`Error: ${err.message}`)
  logger.error(err.stack || '')

  res.status(INTERNAL_SERVER_ERROR).json({
    error: 'Internal Server Error',
    message: err.message,
  })
}
