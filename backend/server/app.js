const http = require('http')
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const utils = require('../common/utils')
const constants = require('../common/constants')
const repository = require('./routes/repository')

const queries = require('../common/queries')

const app = express()
const HttpStatus = constants.http

function init() {
	queries.initializeQueries()
	app.use(bodyParser.json())
	app.use(cors(constants.cors))

	app.get('/api/repository/commits/:owner/:name', repository.getCommits)

	app.use((req, res) => {
		res.status(HttpStatus.notFound).send({ 'message': 'Resource not found' })
	})

	const port = process.env.PORT || 9000

	app.set('port', port)

	const server = http.createServer(app)

	server.listen(port, () => {
		utils.logger.info('Listening on port %s', port)
	})
}

module.exports = {
	init: init
}