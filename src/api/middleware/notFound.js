import { NOT_FOUND } from '../lib/status.js'

// eslint-disable-next-line no-unused-vars
export const notFoundHandler = (req, res, next) => {
  res.status(NOT_FOUND).send({ message: 'Resource not found' })
  next()
}
