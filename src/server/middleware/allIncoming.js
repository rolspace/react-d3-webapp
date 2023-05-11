import { logger } from '../common/logger.js'

export const allIncomingHandler = (req, res, next) => {
  logger.info({ req }, 'Request log')
  next()
}
