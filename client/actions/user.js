/* eslint-disable no-unused-vars */

import { createAction } from 'redux-actions';
import Cookies from 'js-cookie';
import 'whatwg-fetch';
import jsonapi from '../common/jsonapi';

export const USER_FETCHING = 'USER_FETCHING';
export const USER_GET_SUCCESS = 'USER_GET_SUCCESS';
export const USER_GET_FAILURE = 'USER_GET_FAILURE';

export const USER_AUTHENTICATING = 'USER_AUTHENTICATING';
export const USER_LOGIN_SUCCESS = 'USER_LOGIN_SUCCESS';
export const USER_LOGIN_FAILURE = 'USER_LOGIN_FAILURE';

export function getUser() {
	return (dispatch) => {
		dispatch(fetchingUser());

		const id = Cookies.get('id');
		if (id) {
			dispatch(getUserSuccess({
				id: id,
				login: true
			}));
		}
		else {
			dispatch(getUserFailure());
		}
	}
}

export function loginUser(code) {
	return (dispatch) => {
		dispatch(authenticatingUser);

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

export const fetchingUser = createAction(USER_FETCHING);
export const getUserSuccess = createAction(USER_GET_SUCCESS);
export const getUserFailure = createAction(USER_GET_FAILURE);

export const authenticatingUser = createAction(USER_AUTHENTICATING);
export const loginUserSuccess = createAction(USER_LOGIN_SUCCESS);
export const loginUserFailure = createAction(USER_LOGIN_FAILURE);