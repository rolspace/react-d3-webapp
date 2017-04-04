const config = require('config')
const mongoose = require('mongoose');
const utils = require('./common/utils');

mongoose.Promise = global.Promise;

const db = mongoose.createConnection();
let subscribers = [];

db.init = function() {
	db.open(config.db.connection);
};

db.notify = function(event) {
	const eventSubscribers = subscribers.filter((obj) => obj.event === event);
	for (let i = 0; i < eventSubscribers.length; i++) {
		eventSubscribers[i].method();
	}
};

db.subscribe = function(subscriber) {
	subscribers.push(subscriber);
};

db.on(config.db.error, function(error) {
	utils.logger.error('Database error: %', error);
});

db.once(config.db.open, function() {
	utils.logger.info('Database connected');
	
	db.notify(config.db.open);
});

module.exports = db;