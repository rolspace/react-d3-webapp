import { FETCH_TOKEN_SUCCESS } from '../actions/user'

const initialState = {
  isLoggedIn: false,
  username: ''
} 

const user = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_TOKEN_SUCCESS:
      return Object.assign({}, state, {
        isLoggedIn: true,
        username: 'rolspace'
      })
    default:
      return state
  }
}

export default user