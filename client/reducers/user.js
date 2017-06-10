/*eslint-disable no-unused-vars*/

import { USER_GET, USER_LOADING, USER_LOGIN } from '../actions/user';

const initialState = {
	user: {
		auth: false,
		id: '',
		loading: true
	}
}

function user(state = initialState, action) {
	switch (action.type) {
		case USER_GET:
			return Object.assign({}, state, { user: action.payload });
		case USER_LOADING:
			return Object.assign({}, state, { user: action.payload });
		case USER_LOGIN:
			return Object.assign({}, state, { user: action.payload });
		default:
			return state;
	}
}

export default user;