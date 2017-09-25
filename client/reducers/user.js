/*eslint-disable no-unused-vars*/

import { USER_FETCHING, USER_GET_FAILURE, USER_GET_SUCCESS,
	USER_AUTHENTICATING, USER_LOGIN_SUCCESS, USER_LOGIN_FAILURE } from '../actions/user';

const initialState = {
	id: '',
	login: false,
	status: ''
}

const user = (state = initialState, action) => {
	switch (action.type) {
		case USER_AUTHENTICATING:
		case USER_FETCHING:
			return Object.assign({}, state, {
				status: 'PENDING'
			});
		case USER_LOGIN_FAILURE:
		case USER_GET_FAILURE:
			return Object.assign({}, state, {
				status: 'ERROR'
			});
		case USER_LOGIN_SUCCESS:
		case USER_GET_SUCCESS:
			return Object.assign({}, state, {
				id: action.payload.id,
				login: action.payload.login,
				status: 'SUCCESS'
			});
		default:
			return state;
	}
}

export default user;