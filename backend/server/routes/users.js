const config = require('config');
const request = require('request');
const utils = require('../../common/utils');
const jsonApi = require('../../common/jsonapi');
const UserModel = require('../../models/UserModel');

function getUser(req, res) {
	if (!req.params || !req.params.id) {
		res.status(config.http.unprocessable).send(new jsonApi.Error({ detail: 'The id parameter is empty' }));
	}
	else {
		UserModel.findOne({ 'id': req.params.id  })
		.then(data => {
			if (data) {
				const user = {
					id: data.id,
					username: data.username
				};

				utils.logger.info(data);
				res.status(config.http.ok).send(jsonApi.userSerializer.serialize(user));
			}
			else {
				res.status(config.http.notFound).send(new jsonApi.Error({ detail: 'User not found' }))
			}
		})
		.catch(error => {
			utils.logger.error(error);
			res.status(config.http.internalError).send(new jsonApi.Error({ detail: 'Internal server error' }));
		});
	}
}

function postUser(req, res) {
	if (!req.body) {
		res.status(config.http.unprocessable).send(new jsonApi.Error({ detail: 'The request payload is empty' }));
	}
	else
	{
		utils.logger.info(res.body);
		body = JSON.parse(res.body);

		const user = new UserModel({
			id: body.user.id,
			token: body.access_token,
			username: body.user.username
		});

		UserModel.findOne({ 'id': body.user.id  })
		.then(data => {
			let id = '';
			if (data) {
				id = data._id;
				delete data._id;

				data.token = body.access_token;
				utils.logger.info(`Existing user: ${data}`);
			}
			else {
				id = user._id;
				data = user;
				utils.logger.info(`New user: ${data}`)
			}

			UserModel.update({ _id: id }, data, { upsert: true, setDefaultsOnInsert: true })
			.then(result => {
				utils.logger.info(result);

				res.status(config.http.ok).send(jsonapi.userSerializer.serialize({ id: data.id }));
			});
		})
		.catch(error => {
			utils.logger.error(error);
			res.status(config.http.internalError).send(new jsonApi.Error({ detail: 'Internal server error' }));
		});
	}
}

module.exports = {
	get: getUser,
	post: postUser
};