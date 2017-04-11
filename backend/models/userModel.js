const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const db = require('../server/db');

const userSchema = mongoose.Schema({
	'instagram_id': { type: String, index: true, required: true },
	'profile_picture': { type: String },
	'username': { type: String	, required: true },
	'token': { type: String, required: true },
	'token_date': { type: Date, default: Date.now }
	
});

userSchema.pre('save', function(callback) {
	let user = this;

	bcrypt.genSalt(10, (err, salt) => {
		if (err) return callback(err);

		bcrypt.hash(user.instagram_id, salt, (err, hash) => {
			if (err) return callback(err);

			user.instagram_id = hash;
			callback();
		});
	});
});

module.exports = db.model('User', userSchema, 'users');