/*eslint-disable no-unused-vars*/

import { USER_FETCH, USER_FETCH_FAILURE, USER_FETCH_SUCCESS } from '../actions/user';

const initialState = {
	id: '',
	login: false,
	status: 'PENDING'
}

const user = (state = initialState, action) => {
	switch (action.type) {
		case USER_FETCH:
			return Object.assign({}, state, {
				status: 'FETCHING' 
			});
		case USER_FETCH_FAILURE:
			return Object.assign({}, state, {
				status: 'COMPLETE'
			});
		case USER_FETCH_SUCCESS:
			return Object.assign({}, state, {
				id: action.payload.id,
				login: action.payload.login,
				status: 'COMPLETE'
			});
		default:
			return state;
	}
}

export default user;