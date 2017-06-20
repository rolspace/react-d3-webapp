/*eslint-disable no-unused-vars*/
import { createStore, applyMiddleware } from 'redux';
import promiseMiddleware from 'redux-promise';
import thunkMiddleware from 'redux-thunk';
import tunnelstats from '../reducers';

const store = createStore(tunnelstats, applyMiddleware(promiseMiddleware, thunkMiddleware));

export default store;