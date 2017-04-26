/* eslint-disable no-unused-vars */

import { createAction } from 'redux-actions';
import jsonapi from '../core/jsonapi';
import 'whatwg-fetch';

export const REQUEST_LOGIN = 'REQUEST_LOGIN';
export const RECEIVE_LOGIN = 'RECEIVE_LOGIN';

export function login(code) {
	return (dispatch) => {
		dispatch(requestLogin);

		let authorized = false;
		const body = jsonapi.authorizationSerializer.serialize({ code: code });

		fetch('http://localhost:4000/api/authorize/', {
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
			jsonapi.userDeserializer.deserialize(json, (error, users) => {
				if (error) {
					throw new Error(error);
				}
				else {
					const date = new Date();
					date.setDate(date.getDate() + 14);
					document.cookie = `id=${users.id};expires=${(date.toUTCString())};path=/`;

					authorized = true;
				}
			})
		}).catch(error => {
			authorized = false;
		});

		dispatch(receiveLogin(authorized));
	};
}

const requestLogin = createAction(REQUEST_LOGIN);

const receiveLogin = createAction(RECEIVE_LOGIN);	