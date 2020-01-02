import { createAction } from 'redux-actions'
import 'whatwg-fetch'

export const CHANGE_SCREEN = 'CHANGE_SCREEN'

export const changeScreen = createAction(CHANGE_SCREEN)