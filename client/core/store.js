/*eslint-disable no-unused-vars*/
import { createStore, applyMiddleware } from 'redux';
import promiseMiddleware from 'redux-promise';

const store = createStore((state = {}, action) => {
	return state;
}, applyMiddleware(promiseMiddleware));

export default store;