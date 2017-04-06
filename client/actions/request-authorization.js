/* eslint-disable no-console */

import { createAction } from 'redux-actions';
import 'whatwg-fetch';

export const REQUEST_AUTHORIZATION = 'REQUEST_AUTHORIZATION';
export const requestAuthorization = createAction(REQUEST_AUTHORIZATION, /* async */code => {
	//const result = 
	/* await */fetch('http://localhost:4000/api/authentication/', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({ 'code': code }),
	}).then(function(json){
		console.log(json);
		return json;
	});
});	