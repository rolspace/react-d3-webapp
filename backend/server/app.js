const db = require('./db');
const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const utils = require('../common/utils');
const constants = require('../common/constants');
const user = require('./routes/users');
const auth = require('./routes/auth');
const recent = require('./routes/recentmedia');

const app = express();
const HttpStatus = constants.http;

function init() {
	db.subscribe({ event: 'open', method: listen });

	app.use(bodyParser.json())
	app.use(cors(constants.cors));

	app.get('/api/users/:id', user.get);
	app.get('/api/recent/:id', recent.get);
	app.post('/api/auth/', auth.post, user.post);

	app.use((req, res) => {
		res.status(HttpStatus.notFound).send({ 'message': 'Resource not found' });
	});

	app.set('port', process.env.PORT);
	db.init();
}

function listen() {
	const server = http.createServer(app);
	server.listen(process.env.PORT, () => {
		utils.logger.info('Listening on port %s', process.env.PORT);
	});
}

module.exports = {
	init: init
}
