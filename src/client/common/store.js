import { createStore, applyMiddleware } from 'redux'
import promiseMiddleware from 'redux-promise'
import thunkMiddleware from 'redux-thunk'
import reducer from '../reducers'

const store = createStore(reducer, applyMiddleware(promiseMiddleware, thunkMiddleware))

export default store