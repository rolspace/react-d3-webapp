import { createAction } from 'redux-actions';
import promiseMiddleware from 'redux-promise';
import 'whatwg-fetch';

export const REQUEST_AUTHORIZATION = 'REQUEST_AUTHORIZATION';
export const requestAuthorization = createAction(REQUEST_AUTHORIZATION, async code => {
	//const result = 
	await fetch('http://localhost:4000/api/authentication', {
		method: 'POST',
		body: JSON.stringify({
			code: code
		}).then((response) => {
			return response;
		})
	});
});	