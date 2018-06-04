import { combineReducers } from 'redux'
import repo from './repo'
import ui from './ui'

const reducer = combineReducers({
	repo,
	ui
})

export default reducer