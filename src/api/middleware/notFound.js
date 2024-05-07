import { status } from '../lib/status.js'

const { notFound } = status

// eslint-disable-next-line no-unused-vars
export const notFoundHandler = (req, res, next) => {
  res.status(notFound).send({ message: 'Resource not found' })
  next()
}
