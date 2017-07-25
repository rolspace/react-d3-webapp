const request = require('request')
const utils = require('../../common/utils')
const jsonapi = require('../../common/jsonapi')
const HttpStatus = require('../../common/constants').http

function postAuthorization(req, res, next) {
	if (!req.body) {
		res.status(HttpStatus.unprocessable).send(new jsonapi.Error({ detail: 'The request payload is empty' }))
	}
	else {
		jsonapi.deserialize(req.body)
		.then((authorization) => {
			var form = {
				client_id: process.env.INSTAGRAM_CLIENTID,
				client_secret: process.env.INSTAGRAM_SECRET,
				code: authorization.code,
				grant_type: 'authorization_code',
				redirect_uri: process.env.INSTAGRAM_REDIRECT
			}

			request.post({ url: `${process.env.INSTAGRAM_API}`, form: form },
				function(error, response) {
					if (error) {
						utils.logger.error(`${error}: ${response}`)
						res.status(HttpStatus.internalError).send(new jsonapi.Error({ detail: 'Internal server error' }))
					}
					else if (response.statusCode !== HttpStatus.ok) {
						utils.logger.error(response)
						res.status(response.statusCode).send(new jsonapi.Error({ detail: 'Connection to external provider failed' }))
					}
					else {
						res.body = response.body
						next()
					}
				})
		})
		.catch((error) => {
			utils.logger.error(error)
			res.status(HttpStatus.internalError).send(new jsonapi.Error({ detail: 'Internal server error' }))
		})
	}
}

module.exports = {
	post: postAuthorization
}
