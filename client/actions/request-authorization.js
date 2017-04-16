/* eslint-disable no-console */

import { createAction } from 'redux-actions';
import jsonapi from '../core/jsonapi';
import 'whatwg-fetch';

export const REQUEST_AUTHORIZATION = 'REQUEST_AUTHORIZATION';
export const requestAuthorization = createAction(REQUEST_AUTHORIZATION, /* async */code => {
	var payload = jsonapi.authorizationSerializer.serialize({ code: code });

	console.log(payload);
	//const result = 
	/* await */fetch('http://localhost:4000/api/authorization/', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(payload)
	}).then(function(json){
		console.log(json);
		return json;
	});
});	