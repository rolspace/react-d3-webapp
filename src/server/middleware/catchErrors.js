import { status } from '../common/constants.js'
import { logger } from '../common/logger.js'

// eslint-disable-next-line no-unused-vars
export const catchErrorHandler = (err, req, res, next) => {
  logger.error({ err, req })

  res
    .status(status.internalServerError)
    .send({ message: 'Server error, please contact the administrator' })
}
