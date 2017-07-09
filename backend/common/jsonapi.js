const JSONAPISerializer = require('jsonapi-serializer').Serializer;
const JSONAPIDeserializer = require('jsonapi-serializer').Deserializer;
const JSONAPIError = require('jsonapi-serializer').Error;

const mediaSerializer = new JSONAPISerializer('media', { attributes: [ 'created_time', 'likes' ] });
const userSerializer = new JSONAPISerializer('users', { attributes: [ 'username' ] });

const media = {
	serialize: (data) => mediaSerializer.serialize(data)
}

const jsonApiDeserializer = new JSONAPIDeserializer({ keyForAttribute: 'camelCase' });
const deserialize = (json) => jsonApiDeserializer.deserialize(json)

module.exports = {
	deserialize: deserialize,
	Error: JSONAPIError,
	media: media,
	userSerializer: userSerializer,
};