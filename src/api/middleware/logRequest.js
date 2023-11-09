import { logger } from '../lib/logger.js'

// eslint-disable-next-line no-unused-vars
export const logRequestHandler = (req, res, next) => {
  logger.info({ req }, 'Request log')
  next()
}
