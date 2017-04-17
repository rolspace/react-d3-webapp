const config = require('config');
const request = require('request');
const utils = require('../../common/utils');
const jsonApi = require('../../common/jsonapi');
const UserModel = require('../../models/userModel');

function postAuthorization(req, res) {
	if (!req.body) {
		res.status(config.http.unprocessable).send(new jsonApi.Error({ detail: 'The request payload is empty' }));
	}
	else {
		utils.logger.info(req.body);
		jsonApi.authorizationDeserializer.deserialize(req.body, (error, authorization) => {
			var form = {
				client_id: config.client.id,
				client_secret: config.client.secret,
				code: authorization.code,
				grant_type: 'authorization_code',
				redirect_uri: config.client.redirect_uri
			}

			request.post({ url: 'https://api.instagram.com/oauth/access_token', form: form },
				function(error, response, body) {
					utils.logger.info(response);

					if (error) {
						res.status(config.http.internalError).send(new jsonApi.Error({ detail: 'Internal server error.' }));
					}
					else if (response.statusCode !== config.http.ok) {
						res.status(response.statusCode).send(new jsonApi.Error({ detail: 'Connection to external provider failed.' }));
					}
					else {
						json = JSON.parse(response.body);

						const user = new UserModel({
							id: json.user.id,
							token: json.access_token,
							username: json.user.username
						});

						user.save((error) => {
							if (error) {
								res.status(config.http.internalError).send(new jsonApi.Error({ detail: 'Internal server error.' }));
							}
							else {
								res.status(config.http.ok).send(jsonApi.userSerializer.serialize({ id: user.id }));
							}
						});
					}
				});
		});
	}
}

module.exports = {
	post: postAuthorization
};