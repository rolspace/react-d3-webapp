const JSONAPISerializer = require('jsonapi-serializer').Serializer;
const JSONAPIDeserializer = require('jsonapi-serializer').Deserializer;
const JSONAPIError = require('jsonapi-serializer').Error;

const authorizationDeserializer = new JSONAPIDeserializer('authorizations');
const mediaSerializer = new JSONAPISerializer('media', { attributes: [ 'likes' ] });
const userSerializer = new JSONAPISerializer('users', { attributes: [ 'username' ] });

const media = {
	serialize: (data) => mediaSerializer.serialize(data)
}

module.exports = {
	authorizationDeserializer: authorizationDeserializer,
	media: media,
	userSerializer: userSerializer,
	Error: JSONAPIError
};