/*eslint-disable no-unused-vars*/
import { createStore, applyMiddleware } from 'redux';
import thunkMiddleware from 'redux-thunk';
import authorization from '../reducers/login';

const store = createStore(authorization, applyMiddleware(thunkMiddleware));

export default store;