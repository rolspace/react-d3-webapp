/*eslint-disable no-unused-vars*/

import { REQUEST_LOGIN, RECEIVE_LOGIN } from '../actions/login';

const initialState = {
	authorized: false,
	isFetching: false,
	user: {
		id: '',
		name: ''
	}
}

function authorization(state = initialState, action) {
	switch (action.type) {
		case REQUEST_LOGIN:
			return Object.assign({}, state, { isFetching: true });
		case RECEIVE_LOGIN:
			return Object.assign({}, state, { authorized: action.payload, isFetching: false })
	}
}