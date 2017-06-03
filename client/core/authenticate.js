/* eslint-disable no-console */
/* eslint-disable no-unused-vars */

import jsonapi from '../core/jsonapi';
//import Cookies from 'js-cookie';
import 'whatwg-fetch';

const auth = function() {
	return {
		login: async function(code) {
			const body = jsonapi.authorizationSerializer.serialize({ code: code });
			if (code) {
				let response = await fetch('http://localhost:4000/api/auth/', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify(body)
				});
				if (response.status === 200) {
					let json = await response.json();
					jsonapi.userDeserializer.deserialize(json, (error, users) => {
						if (error) {
							throw new Error(error);
						}
						else {
							return true;
						}
					});
				}
				else
				{
					return false;
				}
			}
		},
		user: {
			id: '',
			token: ''
		}
	}
}

module.exports = auth;