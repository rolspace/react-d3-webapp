/* eslint-disable no-console */

import { createAction } from 'redux-actions';
import jsonapi from '../core/jsonapi';
import Cookies from 'js-cookie';
import 'whatwg-fetch';

export const REQUEST_USERLOGIN = 'REQUEST_USERLOGIN';
export const RECEIVE_USERLOGIN = 'RECEIVE_USERLOGIN';
export const REQUEST_USER = 'REQUEST_USER';
export const RECEIVE_USER = 'RECEIVE_USER';

export function loginUser(code) {
	return (dispatch) => {
		dispatch(requestUserLogin);

		let user = {
			fetching: false,
			id: '',
			login: false
		}
		
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
					Cookies.set('login', true);

					user.id = users.id;
					user.login = true;

					dispatch(receiveUserLogin({user: user}));
				}
			})
		}).catch(error => {
			console.log(error);

			dispatch(receiveUserLogin({user: user}));
		});
	}
}

export function verifyUser() {
	return async (dispatch) => {
		const defaultUser = { fetching: true, id: '', login: false }

		dispatch(requestUser({ user: defaultUser }));

		try {
			const id = Cookies.get('id');
			let login = Cookies.get('login');
			login = (login == 'true');
			
			if (id && !login) {
				let response = await fetch(`http://localhost:4000/api/user/${id}`);

				if (response.status === 200) {
					let json = await response.json();

					jsonapi.userDeserializer.deserialize(json)
					.then(user => {
						Cookies.set('login', true);

						dispatch(receiveUser({user: { fetching: false, id: user.id, login: true }}));
					});
				}
			}
			else if (id && login === true) {
				dispatch(receiveUser({user: { fetching: false, id: id, login: login }}));
			}
		}
		catch (error) {
			console.log(error);

			dispatch(receiveUser({user: defaultUser }));
		}
	}
}

const requestUserLogin = createAction(REQUEST_USERLOGIN);

const receiveUserLogin = createAction(RECEIVE_USERLOGIN);

const requestUser = createAction(REQUEST_USER);

const receiveUser = createAction(RECEIVE_USER);