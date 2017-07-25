const mongoose = require('mongoose')
const db = require('../server/db')

const userSchema = mongoose.Schema({
	'id': { type: String, index: true, required: true },
	'profile_picture': { type: String },
	'username': { type: String	, required: true },
	'token': { type: String, required: true },
	'token_date': { type: Date, default: Date.now }
})

module.exports = db.model('User', userSchema, 'users')
