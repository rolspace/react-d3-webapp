import { expect } from 'chai';
import userReducer from '../../reducers/user'

describe('Reducers: User reducer', () => {
  it('returns the initial state if no action is executed', () => {
    expect(userReducer(undefined, {})).to.deep.equal({
      id: '',
      isComplete: false,
      isFetching: false,
      isLoggedIn: false,
      error: null
    })
  })

  it('returns the correct object when the FETCH_USER or LOGIN_USER actions are executed', () => {
    expect(userReducer(undefined, { type: 'FETCH_USER' })).to.deep.equal({
      id: '',
      isComplete: false,
      isFetching: true,
      isLoggedIn: false,
      error: null
    })
  })

  it('returns the correct object when the FETCH_USER_ERROR or LOGIN_USER_ERROR actions are executed', () => {
    expect(userReducer(undefined, { type: 'FETCH_USER_ERROR' })).to.deep.equal({
      id: '',
      isComplete: true,
      isFetching: false,
      isLoggedIn: false,
      error: 'some error'
    })
  })

  it('returns the correct object when the FETCH_USER_SUCCESS or LOGIN_USER_SUCCESS actions are executed', () => {
    const payload = {
      payload: {
        id: '3232534',
        login: true
      }
      type: 'FETCH_USER_SUCCESS'
    }

    expect(userReducer(undefined, payload)).to.deep.equal({
      id: '3232534',
      isComplete: true,
      isFetching: false,
      isLoggedIn: true,
      error: null
    })
  })
})