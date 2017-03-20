import { createAction } from 'redux-actions';

export const RECEIVE_AUTHORIZATION = 'RECEIVE_AUTHORIZATION';
export const receiveAuthorization = createAction(RECEIVE_AUTHORIZATION, (authorized, json) => {
	return {
		authorized: authorized,
		user: json.data
	}
});