/*eslint-disable no-unused-vars*/

import { FETCH_USER, FETCH_USER_ERROR, FETCH_USER_SUCCESS,
	LOGIN_USER, LOGIN_USER_ERROR, LOGIN_USER_SUCCESS } from '../actions/user';

const initialState = {
	id: '',
	isComplete: false,
	isFetching: false,
	isLoggedIn: false,
	error: null
}

const user = (state = initialState, action) => {
	switch (action.type) {
		case LOGIN_USER:
		case FETCH_USER:
			return Object.assign({}, state, {
				isComplete: false,
				isFetching: true
			});
		case LOGIN_USER_ERROR:
		case FETCH_USER_ERROR:
			return Object.assign({}, state, {
				isComplete: true,
				isFetching: false,
				error: 'some error'
			});
		case LOGIN_USER_SUCCESS:
		case FETCH_USER_SUCCESS:
			return Object.assign({}, state, {
				id: action.payload.id,
				isComplete: true,
				isFetching: false,
				isLoggedIn: action.payload.login
			});
		default:
			return state;
	}
}

export default user;