import { logger } from '../lib/logger.js'

export const logRequestHandler = (req, res, next) => {
  logger.info({ req }, 'Request log')
  next()
}
