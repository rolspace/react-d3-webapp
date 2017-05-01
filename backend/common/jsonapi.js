const JSONAPISerializer = require('jsonapi-serializer').Serializer;
const JSONAPIDeserializer = require('jsonapi-serializer').Deserializer;
const JSONAPIError = require('jsonapi-serializer').Error;

const authorizationDeserializer = new JSONAPIDeserializer('authorizations');
const userSerializer = new JSONAPISerializer('users', { attributes: [ ] });

module.exports = {
	authorizationDeserializer: authorizationDeserializer,
	userSerializer: userSerializer,
	Error: JSONAPIError
};