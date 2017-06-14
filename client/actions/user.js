/* eslint-disable no-console */

import { createAction } from 'redux-actions';
import Cookies from 'js-cookie';
import 'whatwg-fetch';

export const USER_GET = 'USER_GET';
export const USER_LOADING = 'USER_LOADING';
export const USER_LOGIN = 'USER_LOGIN';

export const getUser = createAction(USER_GET, () => {
	const id = Cookies.get('id');

	if (id) {
		return {
			auth: true,
			id: id,
			loading: false
		};
	}
	else {
		return {
			auth: false,
			id: '',
			loading: false
		};
	}
});

export const loadingUser = createAction(USER_LOADING, () => {
	return {
		auth: false,
		id: '',
		loading: true	
	};
});

export const loginUser = createAction(USER_LOGIN, (user) => {
	if (user.id) {
		Cookies.set('id', user.id);
		user.auth = true;
	}

	user.loading = false;
	return user;
});