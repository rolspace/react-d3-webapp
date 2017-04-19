/* eslint-disable no-console */

import { createAction } from 'redux-actions';
import jsonapi from '../core/jsonapi';
import 'whatwg-fetch';

export const REQUEST_AUTHORIZATION = 'REQUEST_AUTHORIZATION';
export const requestAuthorization = createAction(REQUEST_AUTHORIZATION, /* async */code => {
	var payload = jsonapi.authorizationSerializer.serialize({ code: code });
	
	const result = /* await */fetch('http://localhost:4000/api/authorization/', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(payload)
	}).then(response => {
		if (response.status === 200) {
			return response.json();
		}
		else {
			throw new Error(response.statusText);
		}
	}).then(json => {
		console.log(json);
		jsonapi.userDeserializer.deserialize(json, (error, users) => {
			if (error) {
				throw new Error(error);
			}
			else {
				const date = new Date();
				date.setDate(date.getDate() + 14);
				document.cookie = `id=${users.id};expires=${(date.toUTCString())};path=/`;
			}
		})
	}).catch(error => {
		console.log(error);
	});
});	