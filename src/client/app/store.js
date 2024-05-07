import { combineReducers } from 'redux'
import { configureStore } from '@reduxjs/toolkit'
import repoReducer from '../features/repo/repoSlice'
import userReducer from '../features/user/userSlice'

export default configureStore({
  reducer: combineReducers({
    repo: repoReducer,
    user: userReducer,
  }),
})
