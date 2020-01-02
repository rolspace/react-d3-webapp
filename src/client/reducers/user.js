import { FETCH_TOKEN_SUCCESS } from '../actions/user'

const initialState = {
  isLoggedIn: false,
  token: ''
} 

const user = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_TOKEN_SUCCESS:
      return Object.assign({}, state, {
        isLoggedIn: action.payload && action.payload.access_token ? true : false,
        token: action.payload ? action.payload.access_token : ''
      })
    default:
      return state
  }
}

export default user