const config = require('config');
const request = require('request');
const utils = require('../../common/utils');
const jsonApi = require('../../common/jsonapi');
const UserModel = require('../../models/userModel');

function getUser(req, res) {

}

module.exports = {
	get: getUser
};