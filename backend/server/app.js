const config = require('config');
const http = require('http');
const express = require('express');
const app = express();

function start() {
	app.use('/api/authentication', require('./routes/authenticationRoutes'));
	
	app.use((req, res) => {
		res.status(config.http.NotFound).send({ 'message': 'Resource not found' });
	});

	app.set('port', config.port);

	const server = http.createServer(app);
	server.listen(config.port, () => {
	});
}

module.exports = {
	start: start
}