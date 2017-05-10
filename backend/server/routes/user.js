const config = require('config');
const request = require('request');
const utils = require('../../common/utils');
const jsonApi = require('../../common/jsonapi');
const UserModel = require('../../models/userModel');

function getUser(req, res) {
	if (!req.params) {
		res.status(config.http.unprocessable).send(new jsonApi.Error({ detail: 'The request parameter is empty' }));
	}
	else {
		UserModel.find({ 'id': req.params.id  }).limit(1)
		.then((result) => {
				console.log(req.params.id);
				console.log(result);

				res.status(200).send();
		});
	}
}

module.exports = {
	get: getUser
};