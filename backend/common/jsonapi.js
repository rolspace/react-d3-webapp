const JSONAPISerializer = require('jsonapi-serializer').Serializer;
const Deserializer = require('jsonapi-serializer').Deserializer;

let userSerializer = new JSONAPISerializer('users', { attributes: [] });

module.exports = {
	userSerializer: userSerializer
};