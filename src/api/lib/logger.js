import bunyan from 'bunyan'

export const logger = bunyan.createLogger({
  name: 'react-d3-api',
  serializers: bunyan.stdSerializers,
})
