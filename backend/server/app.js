const config = require('config');
const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();

function start() {
	const jsonParser = bodyParser.json();

	app.use('/api/authentication', require('./routes/authenticationRoutes'));
	app.use((req, res) => {
		res.status(config.httpNotFound).send({ 'message': 'Resource not found' });
	});

	app.set('port', config.port);

	const server = http.createServer(app);
	server.listen(config.port, () => {
	});
}

module.exports = {
	start: start
}