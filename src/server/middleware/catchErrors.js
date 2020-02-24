const constants = require('../common/constants')
const logger = require('../common/logger')

const { status } = constants

// eslint-disable-next-line no-unused-vars
const catchErrors = (err, req, res, next) => {
  logger.error({ err, req })

  res
    .status(status.internalServerError)
    .send({ message: 'Server error, please contact the administrator' })
}

module.exports = catchErrors
