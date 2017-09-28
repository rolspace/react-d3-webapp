/* eslint-disable no-unused-vars */

import { createAction } from 'redux-actions';
import Cookies from 'js-cookie';
import 'whatwg-fetch';
import jsonapi from '../common/jsonapi';

export const FETCH_USER = 'FETCH_USER';
export const FETCH_USER_SUCCESS = 'FETCH_USER_SUCCESS';
export const FETCH_USER_FAILURE = 'FETCH_USER_FAILURE';

export const LOGIN_USER = 'LOGIN_USER';
export const LOGIN_USER_SUCCESS = 'LOGIN_USER_SUCCESS';
export const LOGIN_USER_FAILURE = 'LOGIN_USER_FAILURE';

export function getUser() {
	return (dispatch) => {
		dispatch(fetchUser());

		const id = Cookies.get('id');
		if (id) {
			dispatch(fetchUserSuccess({
				id: id,
				login: true
			}));
		}
		else {
			dispatch(fetchUserFailure());
		}
	}
}

export function authenticateUser(code) {
	return (dispatch) => {
		dispatch(loginUser);

		const body = jsonapi.authorizationSerializer.serialize({ code: code });
		if (code) {
			fetch('http://localhost:4000/api/auth/', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(body)
			})
			.then(response => {
				if (response.status === 200) {
					return response.json();
				}
				else {
					dispatch(loginUserFailure());
				}
			})
			.then(json => {
				return jsonapi.deserialize(json);
			})
			.then(data => {
				Cookies.set('id', data.id);

				dispatch(loginUserSuccess({
					id: data.id,
					login: true
				}));
			})
			.catch(error => {
				dispatch(loginUserFailure());
			});
		}
	}
}

export const fetchUser = createAction(FETCH_USER);
export const fetchUserSuccess = createAction(FETCH_USER_SUCCESS);
export const fetchUserFailure = createAction(FETCH_USER_FAILURE);

export const loginUser = createAction(LOGIN_USER);
export const loginUserSuccess = createAction(LOGIN_USER_SUCCESS);
export const loginUserFailure = createAction(LOGIN_USER_FAILURE);