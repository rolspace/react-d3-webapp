const bodyParser = require('body-parser')
const cors = require('cors')
const express = require('express')
const constants = require('./common/constants')
const queries = require('./common/queries')
const utils = require('./common/utils')
const promiseHandler = require('./middlewares/promise')
const repo = require('./routes/repo')
const token = require('./routes/token')

const app = express()

const logger = utils.logger
const httpStatus = constants.http

const init = () => {
	queries.loadQueries()
	
	app.use(bodyParser.json())
	app.use(cors(constants.cors))
	
	app.options('/api/token')
	app.post('/api/token', token.postToken)
	app.post('/api/repo/:owner/:name', promiseHandler(repo.getCommits))

	app.use((req, res) => {
		res.status(httpStatus.notFound).send({ 'message': 'Resource not found' })
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