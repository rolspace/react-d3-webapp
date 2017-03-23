const config = require('config');
const express = require('express');
const fetch = require('node-fetch');

function postAuthentication(req, res) {
	fetch('https://api.instagram.com/oauth/access_token', {
		method: 'POST'
	});

	res.status(config.http.Ok).send('postAuthentication method called').end();
}

const router = express.Router();
router.post('/', postAuthentication);

module.exports = router;