/* eslint-disable no-unused-vars */
/* eslint-disable no-console */

import { createAction } from 'redux-actions';
import jsonapi from '../core/jsonapi';
import Cookies from 'js-cookie';
import 'whatwg-fetch';

export const REQUEST_USERLOGIN = 'REQUEST_USERLOGIN';
export const RECEIVE_USERLOGIN = 'RECEIVE_USERLOGIN';
export const VERIFY_USERLOGIN = 'VERIFY_USERLOGIN';

export function loginUser(code) {
	return (dispatch) => {
		dispatch(requestUserLogin);

		let login = false;
		const body = jsonapi.authorizationSerializer.serialize({ code: code });

		fetch('http://localhost:4000/api/authorization/', {
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
					Cookies.set('id', users.id, { expires: 14 });

					login = true;
				}
			})
		}).catch(error => {
			login = false;
		});

		dispatch(receiveUserLogin(login));
	};
}

export function verifyUser() {
	return (dispatch) => {
		const id = Cookies.get('id');

		if (id) {
			fetch(`http://localhost:4000/api/user/${id}`)
			.then(response => {
				if (response.status === 200) {
					return response.json();
				}
				else {
					throw new Error(response.statusText);
				}
			})
			.then(json => {
				jsonapi.userDeserializer.deserialize(json)
				.then(users => {
					console.log(users);
				});
			})
		}

		dispatch(verifyUserLogin(false));
	};
}

const requestUserLogin = createAction(REQUEST_USERLOGIN);

const receiveUserLogin = createAction(RECEIVE_USERLOGIN);

const verifyUserLogin = createAction(VERIFY_USERLOGIN);