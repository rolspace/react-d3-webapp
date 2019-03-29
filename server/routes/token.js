const rp = require('request-promise-native')
const constants = require('../common/constants')
const logger = require('../common/logger')
const ServerError = require('../common/error')

const httpStatus = constants.http

const post = async (req, res, next) => {
  try {
    const { code, state } = req.body

    if (!code || !state ) {
      logger.error({ message: `token.postToken() error: parameter ${!code ? 'code' : 'state'} is empty`, request: req })
      const serverError = new ServerError({
        message: `The parameter ${!code ? 'code' : 'state'} is empty`,
        status: httpStatus.unprocessable
      })

      return res.status(serverError.status).send(serverError)
    }

    const options = {
      method: 'POST',
      uri: 'https://github.com/login/oauth/access_token',
      headers: {
        'Accept': 'application/json'
      },
      formData: {
        client_id: process.env.APPLICATION_ID,
        client_secret: process.env.APPLICATION_SECRET,
        code: code,
        state: state
      }
    }

    const json = await rp.post(options)
    res.status(httpStatus.ok).send(json)
    // .then(json => {
    //   res.status(httpStatus.ok).send(json)
    // })
    // .catch(error => {
    //   logger.error({ message: 'user.postToken() error: Github request failed', error: error, request: req })

    //   const serverError = new ServerError({
    //     message: 'Internal server error',
    //     status: httpStatus.internalError
    //   })

    //   res.status(serverError.status).send(serverError)
    // })
  }
  catch (error) {
    logger.error({ message: 'user.postToken() error: Github request failed', error: error, request: req })
    next(error)
  }
}

module.exports = {
  post
}