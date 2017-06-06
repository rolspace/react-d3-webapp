/* eslint-disable no-console */
/* eslint-disable no-unused-vars */

import jsonapi from '../core/jsonapi';
import 'whatwg-fetch';

async function login(code) {
	const body = jsonapi.authorizationSerializer.serialize({ code: code });
	if (code) {
		try {
			let response = await fetch('http://localhost:4000/api/auth/', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(body)
			});
			if (response.status === 200) {
				const json = await response.json();
				const users = await jsonapi.userDeserializer.deserialize(json);
				
				return {
					auth: true,
					id: users.id
				};
			}

			throw new Error('Authorization service failed to validate');
		}
		catch (error) {
			return {
				auth: false,
				id: ''
			};
		}
	}
}

module.exports = {
	login: login
};