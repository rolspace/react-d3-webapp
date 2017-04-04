const config = require('config');
const request = require('request');

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
			function(error) {
				if (error) {
					res.status(config.http.internalError).send('an error has occurred');
				}
				else {
					res.status(config.http.ok).send('postAuthentication method called');
				}
			});
	}
}

module.exports = {
	post: postAuthentication
};