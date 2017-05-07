/*eslint-disable no-unused-vars*/
import { createStore, applyMiddleware } from 'redux';
import thunkMiddleware from 'redux-thunk';
import user from '../reducers/user';

const store = createStore(user, applyMiddleware(thunkMiddleware));

export default store;