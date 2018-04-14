/* eslint-disable no-console */

const path = require('path')
const http = require('http')
const express = require('express')

const app = express()

function init() {
	app.use(express.static(path.join(process.cwd() + '/public')))

	app.get('*', function (req, res) {
		res.sendFile(path.join(process.cwd(), '/public/index.html'))
	})

	app.use((req, res) => {
		res.status(config.http.notFound).send({ 'message': 'Resource not found' })
	})

	app.set('port', config.port)

	const server = http.createServer(app)
	server.listen(config.express.port, () => {
		console.log('Listening on port %s', config.express.port)
	})
}

module.exports = {
	init: init
}