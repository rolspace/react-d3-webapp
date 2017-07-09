/* eslint-disable no-unused-labels */

const JSONAPISerializer = require('jsonapi-serializer').Serializer;
const JSONAPIDeserializer = require('jsonapi-serializer').Deserializer;

const authorizationSerializer = new JSONAPISerializer('authorizations', { attributes: [ 'code' ] });
const jsonApiDeserializer = new JSONAPIDeserializer({ keyForAttribute: 'camelCase' });
//const userDeserializer = new JSONAPIDeserializer('users');

// const media = {
// 	deserialize: (json) => jsonApiDeserializer.deserialize(json)
// }

const deserialize = (json) => jsonApiDeserializer.deserialize(json)

module.exports = {
	authorizationSerializer: authorizationSerializer,
	deserialize: deserialize
}