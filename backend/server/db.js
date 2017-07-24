const mongoose = require('mongoose')
const utils = require('../common/utils')

mongoose.Promise = global.Promise

const db = mongoose.createConnection()
let subscribers = []

db.init = function() {
	db.open(process.env.DB_CONNECTION)
}

db.notify = function(event) {
	const eventSubscribers = subscribers.filter((obj) => obj.event === event)
	for (let i = 0; i < eventSubscribers.length; i++) {
		eventSubscribers[i].method()
	}
}

db.subscribe = function(subscriber) {
	subscribers.push(subscriber)
}

db.on('error', function(error) {
	utils.logger.error('Database error: %', error)
})

db.once('open', function() {
	utils.logger.info('Database connected')
	db.notify('open')
})

module.exports = db
