const JSONAPISerializer = require('jsonapi-serializer').Serializer;
const JSONAPIError = require('jsonapi-serializer').Error;

const userSerializer = new JSONAPISerializer('users', { attributes: [] });

module.exports = {
	Error: JSONAPIError,
	userSerializer: userSerializer
};