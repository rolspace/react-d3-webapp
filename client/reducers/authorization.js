/*eslint-disable no-unused-vars*/

//import { handleAction } from 'redux-actions';
import { REQUEST_AUTHORIZATION } from '../actions/request-authorization';
import { RECEIVE_AUTHORIZATION } from '../actions/receive-authorization';

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
		case REQUEST_AUTHORIZATION:
			return Object.assign({}, state, { isFetching: true });
		case RECEIVE_AUTHORIZATION:
			return Object.assign({}, state, { isFetching: false })
	}
}