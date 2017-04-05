const bunyan = require('bunyan');

const logger = bunyan.createLogger({
	name: 'expressjskit'
});

module.exports = {
	logger
};