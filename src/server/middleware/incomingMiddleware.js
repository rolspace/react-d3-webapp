const logger = require('../common/logger')

const incomingHandler = (req, res, next) => {
  logger.info({ req }, 'Request log')
  next()
}

module.exports = incomingHandler
