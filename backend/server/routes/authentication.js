const config = require('config');
const request = require('request');
const utils = require('../../common/utils');
const UserModel = require('../../models/userModel');


function postAuthentication(req, res) {
	if (!req.body || !req.body.code) {
		res.status(config.http.unprocessable).send('"code" parameter is missing');
	}
	else {
		var form = {
			client_id: config.client.id,
			client_secret: config.client.secret,
			code: req.body.code,
			grant_type: 'authorization_code',
			redirect_uri: config.client.redirect_uri
		}

		request.post({ url: 'https://api.instagram.com/oauth/access_token', form: form },
			function(error, response, body) {
				utils.logger.info(response);
				if (error) {
					res.status(config.http.internalError).send('an error has occurred');
				}
				else if (response.statusCode !== config.http.ok) {
					res.status(response.statusCode).send('postAuthentication method failed');
				}
				else {
					json = JSON.parse(response.body);

					let user = new UserModel();
					user.instagram_id = json.user.id;
					user.access_token = json.access_token;
					user.username = json.user.username;

					user.save((err) => {
						if (err) {
							console.log(err);
						}
						else {
							console.log("success");
						}
					});

					res.status(config.http.ok).send('postAuthentication method called successfully');
				}
			});
	}
}

module.exports = {
	post: postAuthentication
};