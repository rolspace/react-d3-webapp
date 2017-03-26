const config = require('config');
const cors = require('cors');
const express = require('express');
const fetch = require('node-fetch');
const bodyParser = require('body-parser');

function postAuthentication(req, res) {
	});

	res.status(config.http.Ok).send('postAuthentication method called').end();
}

const router = express.Router();
router.use(bodyParser.json())
router.use(cors(config.cors));

router.post('/', postAuthentication);

module.exports = router;