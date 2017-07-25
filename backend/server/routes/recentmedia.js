const rp = require('request-promise-native')
const utils = require('../../common/utils')
const jsonapi = require('../../common/jsonapi')
const HttpStatus = require('../../common/constants').http
const UserModel = require('../../models/UserModel')

function getRecentMedia(req, res) {
	if (!req.params || !req.params.id) {
		utils.logger.error(`GET RecentMedia, error, params empty: ${req}`)
		res.status(HttpStatus.unprocessable).send(new jsonapi.Error({ detail: 'The id parameter is empty' }))
	}
	else {
		UserModel.findOne({ 'id': req.params.id  })
		.then(data => {
			if (data) {
				utils.logger.info(`GET RecentMedia, user found: ${data}`)

				//VALIDATE JWT TOKEN SOMEWHERE HERE
				const options = {
					uri: 'https://api.instagram.com/v1/users/self/media/recent/',
					qs: {
						access_token: data.token
					},
					json: true
				}
				rp.get(options)
				.then(json => {
					utils.logger.info(json);
					res.status(HttpStatus.ok).send(jsonapi.media.serialize(json.data))
					//res.status(HttpStatus.ok).send(jsonapi.serialize(jsonapi.types.media, json.data))
				})
				.catch(error => {
					throw new Error(error);
				})
			}
			else {
				utils.logger.info(`GET RecentMedia, user not found: ${req}`)
				res.status(HttpStatus.notFound).send(new jsonapi.Error({ detail: 'User not found' }))
			}
		})
		.catch(error => {
			utils.logger.error(`GET RecentMedia, general error: ${error}`)
			res.status(HttpStatus.internalError).send(new jsonapi.Error({ detail: 'Internal server error' }))
		})
	}
}

module.exports = {
	get: getRecentMedia
}
