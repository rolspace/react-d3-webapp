/* eslint-disable no-unused-labels */

const JSONAPISerializer = require('jsonapi-serializer').Serializer;
const JSONAPIDeserializer = require('jsonapi-serializer').Deserializer;

const authorizationSerializer = new JSONAPISerializer('authorizations', { attributes: [ 'code' ] });
const mediaDeserializer = new JSONAPIDeserializer('media');
const userDeserializer = new JSONAPIDeserializer('users');

const media = {
	deserialize: (json) => mediaDeserializer.deserialize(json)
}

module.exports = {
	authorizationSerializer: authorizationSerializer,
	media: media,
	userDeserializer: userDeserializer
}