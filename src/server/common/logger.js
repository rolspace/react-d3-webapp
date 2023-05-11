import bunyan from 'bunyan'

export const logger = bunyan.createLogger({
  name: 'reactd3-server',
  serializers: bunyan.stdSerializers,
})
