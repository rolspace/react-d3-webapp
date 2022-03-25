const bunyan = require('bunyan')

const logger = bunyan.createLogger({
  name: 'react-d3-server',
  serializers: bunyan.stdSerializers,
})

module.exports = logger
