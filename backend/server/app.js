const db = require('./db');
const config = require('config');
const http = require('http');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const authorization = require('./routes/authorization');

const app = express();

function init() {
	db.subscribe({ event: config.db.open, method: listen });

	app.use(bodyParser.json())
	app.use(cors(config.cors));
	
	app.post('/api/authorization/', authorization.post);
	
	app.use((req, res) => {
		res.status(config.http.notFound).send({ 'message': 'Resource not found' });
	});

	app.set('port', config.port);

	db.init();
}

function listen() {
	const server = http.createServer(app);
		server.listen(config.port, () => {
			//logger.info('Listening on port %s', config.port);
		});
}

module.exports = {
	init: init
}