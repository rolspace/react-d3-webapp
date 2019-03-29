const rp = require('request-promise-native')
const utils = require('../common/utils')
const AppError = require('../common/error')
const HttpStatus = require('../common/constants').http

const logger = utils.logger

const post = (req, res) => {
  const { code, state } = req.body

  if (!code || !state ) {
    logger.error({ message: `token.postToken() error: parameter ${!code ? 'code' : 'state'} is empty`, request: req })
    const appError = new AppError({
      message: `The parameter ${!code ? 'code' : 'state'} is empty`,
      status: HttpStatus.unprocessable
    })

    return res.status(appError.status).send(appError)
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
    res.status(HttpStatus.ok).send(json)
  })
  .catch(error => {
    logger.error({ message: 'user.postToken() error: Github request failed', error: error, request: req })

    const appError = new AppError({
			message: 'Internal server error',
			status: HttpStatus.internalError
		})

    res.status(appError.status).send(appError)
  })
}

module.exports = {
  post
}