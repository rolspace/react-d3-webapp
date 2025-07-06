import { combineReducers } from 'redux'
import { configureStore } from '@reduxjs/toolkit'
import repoReducer from '../features/repo/repoSlice.js'
import userReducer from '../features/user/userSlice.js'

export default configureStore({
  reducer: combineReducers({
    repo: repoReducer,
    user: userReducer,
  }),
})
