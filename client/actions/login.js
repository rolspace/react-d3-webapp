/* eslint-disable no-console */

import { createAction } from 'redux-actions';
import jsonapi from '../core/jsonapi';
import 'whatwg-fetch';

export const REQUEST_LOGIN = 'REQUEST_LOGIN';
export const RECEIVE_LOGIN = 'RECEIVE_LOGIN';

export function logIn(code) {
	return (dispatch) => {
		dispatch(requestLogIn);

		var body = jsonapi.authorizationSerializer.serialize({ code: code });

		const authorized = fetch('http://localhost:4000/api/authorization/', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(body)
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

					return true;
				}
			})
		}).catch(error => {
			console.log(error);

			return false;
		});

		dispatch(receiveLogIn(authorized));
	};
}

const requestLogIn = createAction(REQUEST_LOGIN);

const receiveLogIn = createAction(RECEIVE_LOGIN);	