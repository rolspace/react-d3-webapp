const logger = require('../common/logger')

const logHandler = (req, res, next) => {
  logger.info({ request: req }, 'Request log')
  next()
}

module.exports = logHandler