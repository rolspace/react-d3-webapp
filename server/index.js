const bodyParser = require('body-parser')
const cors = require('cors')
const express = require('express')
const path = require('path')
const constants = require('./common/constants')
const logger = require('./common/logger')
const queries = require('./common/queries')
const logHandler = require('./middleware/logHandler')
const promiseHandler = require('./middleware/promiseHandler')
const repo = require('./routes/repo')
const token = require('./routes/token')

const app = express()
const ns = path.relative(process.cwd(), __filename)
const httpStatus = constants.http

const init = () => {
	queries.loadQueries()
	
	app.use(bodyParser.json())
	app.use(cors(constants.cors))
	app.use(logHandler)
	
	app.options('/api/token')
	app.post('/api/token', promiseHandler(token.post))
	app.post('/api/repo/:owner/:name', promiseHandler(repo.post))

	app.use((req, res) => {
		logger.info({ ns: `${ns}:init` }, 'Resource not found')
		res.status(httpStatus.notFound).send({ 'message': 'Resource not found' })
	})
	
	const port = process.env.PORT || 9000
	
	app.set('port', port)
	
	app.listen(port, () => {
		logger.info({ ns: `${ns}:init` }, `Server started and listening on port: ${port}`)
	})
}

module.exports = {
	init
}