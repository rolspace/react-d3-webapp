const config = require('config');
const cors = require('cors');
const express = require('express');
const fetch = require('node-fetch');
const bodyParser = require('body-parser');
const request = require('request');

function postAuthentication(req, res) {
	var form = {
		client_id: config.client.id,
		client_secret: config.client.secret,
		redirect_uri: config.client.redirect_uri,
		grant_type: 'authorization_code',
		code: req.body.code
	}
	
	request.post({ url: 'https://api.instagram.com/oauth/access_token', form: form }, function(error, response, body) {
		console.log(body);
	});

	res.status(config.http.Ok).send('postAuthentication method called').end();
}

const router = express.Router();
router.use(bodyParser.json())
router.use(cors(config.cors));

router.post('/', postAuthentication);

module.exports = router;