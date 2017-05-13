const config = require('config');
const request = require('request');
const utils = require('../../common/utils');
const jsonApi = require('../../common/jsonapi');
const UserModel = require('../../models/userModel');

function getUser(req, res) {
	if (!req.params) {
		res.status(config.http.unprocessable).send(new jsonApi.Error({ detail: 'The id parameter is empty' }));
	}
	else {
		UserModel.findOne({ 'id': req.params.id  })
		.then(result => {
			const user = {
				id: result.id,
				username: result.username
			};

			res.status(config.http.ok).send(jsonApi.userSerializer.serialize(user));
		})
		.catch(error => {
			res.status(config.http.notFound).send(new jsonApi.Error({ detail: 'User not found'}))
		});
	}
}

function postUser(req, res) {
	if (!req.body) {
		res.status(config.http.unprocessable).send(new jsonApi.Error({ detail: 'The request payload is empty' }));
	}
	else
	{
		body = JSON.parse(response.body);

		const user = new UserModel({
			id: body.user.id,
			token: body.access_token,
			username: body.user.username
		});

		user.save(error => {
			if (error) {
				res.status(config.http.internalError).send(new jsonApi.Error({ detail: 'Internal server error' }));
			}
			else {
				res.status(config.http.ok).send(jsonApi.userSerializer.serialize({ id: user.id }));
			}
		});
	}
}

module.exports = {
	get: getUser,
	post: postUser
};