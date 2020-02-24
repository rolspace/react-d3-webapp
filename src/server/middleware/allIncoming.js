const logger = require('../common/logger')

const allIncomingHandler = (req, res, next) => {
  logger.info({ req }, 'Request log')
  next()
}

module.exports = allIncomingHandler
