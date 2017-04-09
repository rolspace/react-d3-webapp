const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const db = require('../server/db');

const userSchema = mongoose.Schema({
	'instagram_id': { type: String, index: true, required: true },
	'access_token': { type: String, required: true },
	'username': { type: String	, required: true },
	'profile_picture': { type: String }
});

userSchema.pre('save', function(callback) {
	let user = this;

	bcrypt.genSalt(10, (err, salt) => {
		if (err) return callback(err);

		bcrypt.hash(user.access_token, salt, (err, hash) => {
			if (err) return callback(err);

			user.access_token = hash;
			callback();
		});
	});
});

module.exports = db.model('User', userSchema, 'users');