const config = require('config');
const request = require('request');
const utils = require('../../common/utils');
const jsonapi = require('../../common/jsonapi');
const UserModel = require('../../models/UserModel');

function postAuthorization(req, res) {
	if (!req.body) {
		res.status(config.http.unprocessable).send(new jsonapi.Error({ detail: 'The request payload is empty' }));
	}
	else {
		jsonapi.authorizationDeserializer.deserialize(req.body)
		.then((authorization) => {
			var form = {
				client_id: config.client.id,
				client_secret: config.client.secret,
				code: authorization.code,
				grant_type: 'authorization_code',
				redirect_uri: config.client.redirect_uri
			}

			request.post({ url: 'https://api.instagram.com/oauth/access_token', form: form },
				function(error, response, body) {
					if (error) {
						utils.logger.error(error);
						utils.logger.error(response);
						res.status(config.http.internalError).send(new jsonapi.Error({ detail: 'Internal server error' }));
					}
					else if (response.statusCode !== config.http.ok) {
						utils.logger.error(response);
						res.status(response.statusCode).send(new jsonapi.Error({ detail: 'Connection to external provider failed' }));
					}
					else {
						body = JSON.parse(response.body);

						const user = new UserModel({
							id: body.user.id,
							token: body.access_token,
							username: body.user.username
						});

						user.save((error) => {
							if (error) {
								utils.logger.error(error);
								res.status(config.http.internalError).send(new jsonapi.Error({ detail: 'Internal server error' }));
							}
							else {
								utils.logger.info(user);
								res.status(config.http.ok).send(jsonapi.userSerializer.serialize({ id: user.id }));
							}
						});
					}
				});
		})
		.catch((error) => {
			utils.logger.error(error);
			res.status(config.http.internalError).send(new jsonapi.Error({ detail: 'Internal server error' }));
		});
	}
}

module.exports = {
	post: postAuthorization
};