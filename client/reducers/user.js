/*eslint-disable no-unused-vars*/

import { REQUEST_USERLOGIN, RECEIVE_USERLOGIN,
	REQUEST_USER, RECEIVE_USER } from '../actions/user';

const initialState = {
	user: {
		fetching: false,
		id: '',
		login: false
	}
};

function user(state = initialState, action) {
	switch (action.type) {
		case REQUEST_USERLOGIN:
			return Object.assign({}, state, { user: { fetching: true }});
		case RECEIVE_USERLOGIN:
			return Object.assign({}, state, action.payload);
		case REQUEST_USER:
			return Object.assign({}, state, { user: { fetching: true }});
		case RECEIVE_USER:
			return Object.assign({}, state, action.payload);
		default:
			return state;
	}
}

export default user;