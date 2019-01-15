const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const utils = require('../common/utils')
const queries = require('../common/queries')
const constants = require('../common/constants')
const repo = require('./routes/repo')
const user = require('./routes/user')

const app = express()
const logger = utils.logger
const HttpStatus = constants.http

const init = () => {
	queries.loadQueries()
	app.use(bodyParser.json())
	app.use(cors(constants.cors))
	
	app.options('/api/user/token')
	app.post('/api/user/token', user.postToken)
	app.post('/api/repo/:owner/:name', repo.getCommits)

	app.use((req, res) => {
		res.status(HttpStatus.notFound).send({ 'message': 'Resource not found' })
	})
	
	const port = process.env.PORT || 9000
	
	app.set('port', port)
	
	app.listen(port, () => {
		logger.info('app.init() info: Server started and listening on port %s', port)
	})
}

module.exports = {
	init
}