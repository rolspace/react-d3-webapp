/*eslint-disable no-unused-vars*/
import { createStore, applyMiddleware } from 'redux';
import promiseMiddleware from 'redux-promise';
import thunkMiddleware from 'redux-thunk';
import user from '../reducers/user';

const store = createStore(user, applyMiddleware(promiseMiddleware, thunkMiddleware));

export default store;