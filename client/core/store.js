/*eslint-disable no-unused-vars*/
import { createStore, applyMiddleware } from 'redux';
import thunkMiddleware from 'redux-thunk';

const store = createStore((state = {}, action) => {
	return state;
}, applyMiddleware(thunkMiddleware));

export default store;