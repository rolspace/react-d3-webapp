const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const db = require('../server/db');

const userSchema = mongoose.Schema({
	'instagramId': { type: String, unique: true, index: true, required: true },
	'token': { type: String, required: true },
	'userName': { type: String	, required: true },
	'profilePicture': { type: String }
});

userSchema.pre('save', function(callback) {
	let user = this;

	bcrypt.genSalt(10, (err, salt) => {
		if (err) return callback(err);

		bcrypt.hash(user.token, salt, (err, hash) => {
			if (err) return callback(err);

			user.token = hash;
		});

		bcrypt.hash(user.instagramId, salt, (err, hash) => {
			if (err) return callback(err);

			user.token = hash;
		});

		callback();
	});
});

module.exports = db.model('User', userSchema, 'users');