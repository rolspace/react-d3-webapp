import { status } from '../lib/constants.js'
import { logger } from '../lib/logger.js'

const { internalServerError } = status

// eslint-disable-next-line no-unused-vars
export const catchErrorHandler = (err, req, res, next) => {
  logger.error({ err, req })

  res
    .status(internalServerError)
    .send({ message: 'Server error, please contact the administrator' })
}
