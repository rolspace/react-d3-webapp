const bunyan = require('bunyan')

const logger = bunyan.createLogger({
	name: 'tunnelstats'
})

module.exports = {
	logger
}
