const rp = require('request-promise-native')
const constants = require('../common/constants')
const ServerError = require('../common/error')
const utils = require('../common/utils')

const logger = utils.logger
const httpStatus = constants.http

const post = (req, res) => {
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

  rp.post(options)
  .then(json => {
    res.status(httpStatus.ok).send(json)
  })
  .catch(error => {
    logger.error({ message: 'user.postToken() error: Github request failed', error: error, request: req })

    const serverError = new ServerError({
			message: 'Internal server error',
			status: httpStatus.internalError
		})

    res.status(serverError.status).send(serverError)
  })
}

module.exports = {
  post
}