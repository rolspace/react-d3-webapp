import { combineReducers } from 'redux'
import repo from './repo'
import ui from './ui'
import user from './user'

const reducer = combineReducers({
	repo,
	ui,
	user
})

export default reducer