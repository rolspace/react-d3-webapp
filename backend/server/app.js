const config = require('config');
const utils = require('../common/utils');

const http = require('http');
const db = require('./db');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const user = require('./routes/user');
const authorization = require('./routes/authorization');

const app = express();

function init() {
	db.subscribe({ event: config.db.open, method: listen });

	app.use(bodyParser.json())
	app.use(cors(config.cors));
	
	app.post('/api/authorization/', authorization.post);
	app.get('/api/user/:id', user.get);
	
	app.use((req, res) => {
		res.status(config.http.notFound).send({ 'message': 'Resource not found' });
	});

	app.set('port', config.port);

	db.init();
}

function listen() {
	const server = http.createServer(app);
	server.listen(config.port, () => {
			utils.logger.info('Listening on port %s', config.port);
	});
}

module.exports = {
	init: init
}