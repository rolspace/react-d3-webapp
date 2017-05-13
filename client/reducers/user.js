/*eslint-disable no-unused-vars*/

import { REQUEST_USERLOGIN, RECEIVE_USERLOGIN } from '../actions/login';

const initialState = {
	user: {
		id: '',
		fetching: false,
		login: false
	}
}

function user(state = initialState, action) {
	switch (action.type) {
		case REQUEST_USERLOGIN:
			return Object.assign({}, state, { fetching: true });
		case RECEIVE_USERLOGIN:
			return Object.assign({}, state, { user: { fetching: false, login: action.payload } });
		default:
			return state;
	}
}

export default user;