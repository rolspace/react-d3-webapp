import { Request, Response, NextFunction } from 'express'
import { logger } from '../lib/logger.js'

export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  logger.info(`${req.method} ${req.path}`)
  next()
}
