import { logger } from '../lib/logger.js'

export const allIncomingHandler = (req, res, next) => {
  logger.info({ req }, 'Request log')
  next()
}
