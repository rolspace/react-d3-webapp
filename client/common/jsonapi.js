const JSONAPISerializer = require('jsonapi-serializer').Serializer;
const JSONAPIDeserializer = require('jsonapi-serializer').Deserializer;

const authorizationSerializer = new JSONAPISerializer('authorizations', { attributes: [ 'code' ] });

const jsonApiDeserializer = new JSONAPIDeserializer({ keyForAttribute: 'camelCase' });
const deserializer = (json) => jsonApiDeserializer.deserialize(json)

module.exports = {
	authorizationSerializer: authorizationSerializer,
	deserializer: deserializer
}