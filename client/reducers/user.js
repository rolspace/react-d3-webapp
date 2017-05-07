/*eslint-disable no-unused-vars*/

import { REQUEST_LOGIN, RECEIVE_LOGIN } from '../actions/login';

const initialState = {
	user: {
		id: '',
		isFetching: false,
		loggedIn: false
	}
}

function user(state = initialState, action) {
	switch (action.type) {
		case REQUEST_LOGIN:
			return Object.assign({}, state, { isFetching: true });
		case RECEIVE_LOGIN:
			return Object.assign({}, state, { user: { isFetching: false, loggedIn: action.payload } });
		default:
			return state;
	}
}

export default user;