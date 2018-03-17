const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const utils = require('../common/utils');
const constants = require('../common/constants');
const repository = require('./routes/repository');

const app = express();
const HttpStatus = constants.http;

function init() {
	app.use(bodyParser.json())
	app.use(cors(constants.cors));

	app.get('/api/repository/commits/:repo', repository.getCommits);

	app.use((req, res) => {
		res.status(HttpStatus.notFound).send({ 'message': 'Resource not found' });
	});

	app.set('port', process.env.PORT);

	const server = http.createServer(app);

	server.listen(process.env.PORT, () => {
		utils.logger.info('Listening on port %s', process.env.PORT);
	});
}

module.exports = {
	init: init
}