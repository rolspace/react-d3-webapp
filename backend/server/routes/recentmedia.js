const config = require('config');
const rp = require('request-promise-native');
const utils = require('../../common/utils');
const jsonapi = require('../../common/jsonapi');
const UserModel = require('../../models/UserModel');

function getRecentMedia(req, res) {
	if (!req.params || !req.params.id) {
		utils.logger.error(`GET RecentMedia, error, params empty: ${req}`);
		res.status(config.http.unprocessable).send(new jsonapi.Error({ detail: 'The id parameter is empty' }));
	}
	else {
		UserModel.findOne({ 'id': req.params.id  })
		.then(data => {
			if (data) {
				utils.logger.info(`GET RecentMedia, user found: ${data}`);

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
					res.status(config.http.ok).send(json);
				})
				.catch(error => {
					throw new Error(error);
				})
			}
			else {
				utils.logger.info(`GET RecentMedia, user not found: ${req}`);
				res.status(config.http.notFound).send(new jsonapi.Error({ detail: 'User not found' }))
			}
		})
		.catch(error => {
			utils.logger.error(`GET RecentMedia, general error: ${error}`);
			res.status(config.http.internalError).send(new jsonapi.Error({ detail: 'Internal server error' }));
		});
	}
}

module.exports = {
	get: getRecentMedia
}