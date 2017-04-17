const JSONAPISerializer = require('jsonapi-serializer').Serializer;
const JSONAPIDeserializer = require('jsonapi-serializer').Deserializer;

const authorizationSerializer = new JSONAPISerializer('authorizations', { attributes: [ 'code' ] });
const userDeserializer = new JSONAPIDeserializer('users');

module.exports = {
	authorizationSerializer: authorizationSerializer,
	userDeserializer: userDeserializer
};