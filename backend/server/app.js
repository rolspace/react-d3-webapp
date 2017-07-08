const config = require('config');
const utils = require('../common/utils');

const db = require('./db');
const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const user = require('./routes/users');
const auth = require('./routes/auth');
const recent = require('./routes/recentmedia');

const app = express();

function init() {
	db.subscribe({ event: config.db.open, method: listen });

	app.use(bodyParser.json())
	app.use(cors(config.cors));
	
	app.get('/api/users/:id', user.get);
	app.get('/api/recent/:id', recent.get);
	app.post('/api/auth/', auth.post, user.post);
	
	app.use((req, res) => {
		res.status(config.http.notFound).send({ 'message': 'Resource not found' });
	});

	app.set('port', config.port);
	db.init();
}

function listen() {
	const server = http.createServer(app);
	server.listen(config.express.port, () => {
		utils.logger.info('Listening on port %s', config.express.port);
	});
}

module.exports = {
	init: init
}