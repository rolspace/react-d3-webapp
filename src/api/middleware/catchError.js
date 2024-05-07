import { logger } from '../lib/logger.js'
import { INTERNAL_SERVER_ERROR } from '../lib/status.js'

// eslint-disable-next-line no-unused-vars
export const catchErrorHandler = (err, req, res, next) => {
  logger.error({ err, req })

  res
    .status(INTERNAL_SERVER_ERROR)
    .send({ message: 'Server error, please contact the administrator' })
}
