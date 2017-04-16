const JSONAPISerializer = require('jsonapi-serializer').Serializer;

const authorizationSerializer = new JSONAPISerializer('authorizations', { attributes: [ 'code' ] });

module.exports = {
	authorizationSerializer: authorizationSerializer
};