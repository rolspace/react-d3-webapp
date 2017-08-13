const JSONAPISerializer = require('jsonapi-serializer').Serializer;
const JSONAPIDeserializer = require('jsonapi-serializer').Deserializer;
const JSONAPIError = require('jsonapi-serializer').Error;

const types = {
	media: 'media',
	users: 'users'
}

const mediaSerializer = new JSONAPISerializer('media', { attributes: [ 'created_time', 'comments', 'likes' ] })
const userSerializer = new JSONAPISerializer('users', { attributes: [ 'username' ] })

const serialize = (type, data) => {
	let serializer;
	switch (type) {
		case 'media':
			serializer = mediaSerializer
			break;
		case 'users':
			serializer = userSerializer
			break;
		default:
			serializer = data => { data }
	}

	return serializer.serialize(data)
}

const jsonApiDeserializer = new JSONAPIDeserializer({ keyForAttribute: 'camelCase' })
const deserialize = (json) => jsonApiDeserializer.deserialize(json)

module.exports = {
	deserialize: deserialize,
	Error: JSONAPIError,
	serialize: serialize,
	types: types
};
