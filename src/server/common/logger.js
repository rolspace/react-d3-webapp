const bunyan = require('bunyan')

const logger = bunyan.createLogger({
	name: 'react-d3-server'
})

module.exports = logger
