/* eslint-disable no-console */

import _ from 'lodash'
import { CHANGE_SCREEN } from '../actions/ui'

const initialState = {
	screen: ''
}

const ui = (state = initialState, action) => {
	switch (action.type) {
		case CHANGE_SCREEN:
			return _.merge({}, state, {
				screen: action.payload.screen
			})
		default:
			return state
	}
}

export default ui