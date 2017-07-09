/* eslint-disable no-unused-vars */

import { createAction } from 'redux-actions';
import Cookies from 'js-cookie';
import 'whatwg-fetch';
import jsonapi from '../common/jsonapi';

export const USER_FETCH = 'USER_FETCH';
export const USER_FETCH_SUCCESS = 'USER_FETCH_SUCCESS';
export const USER_FETCH_FAILURE = 'USER_FETCH_FAILURE';

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

export function loginUser(code) {
	return (dispatch) => {
		dispatch(fetchUser);

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
					dispatch(fetchUserFailure());
				}
			})
			.then(json => {
				return jsonapi.userDeserializer.deserialize(json);
			})
			.then(data => {
				Cookies.set('id', data.id);
				
				dispatch(fetchUserSuccess({
					id: data.id,
					login: true
				}));
			})
			.catch(error => {
				dispatch(fetchUserFailure());
			});
		}
	}
}

export const fetchUser = createAction(USER_FETCH);
export const fetchUserSuccess = createAction(USER_FETCH_SUCCESS);
export const fetchUserFailure = createAction(USER_FETCH_FAILURE);