import bunyan from 'bunyan'

export const logger = bunyan.createLogger({
  name: 'reactd3-api',
  serializers: bunyan.stdSerializers,
})
