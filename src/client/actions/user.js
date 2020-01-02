/*eslint-disable no-console*/

import 'whatwg-fetch'
import { createAction } from 'redux-actions'

export const QUERYING_TOKEN = 'QUERYING_TOKEN'
export const QUERY_TOKEN_ERROR = 'QUERY_TOKEN_ERROR'
export const QUERY_TOKEN_SUCCESS = 'QUERY_TOKEN_SUCCESS'
export const FETCHING_TOKEN = 'FETCHING_TOKEN'
export const FETCH_TOKEN_ERROR = 'FETCHING_TOKEN'
export const FETCH_TOKEN_SUCCESS = 'FETCHING_TOKEN'

export const fetchToken = (code, state) => {
  return (dispatch) => {
    dispatch(fetchingToken())

    return fetch(`${process.env.SERVER_URL}/api/token/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        code: code,
        state: state,
      })
    })
    .then(response => {
      if (response.status === 200) {
        return response.json()
      }
      else {
        dispatch(fetchTokenError())
      }
    })
    .then(json => {
      dispatch(fetchTokenSuccess(json))
    })
  }
}

const fetchingToken =  createAction(FETCHING_TOKEN)
const fetchTokenError =  createAction(FETCH_TOKEN_ERROR)
const fetchTokenSuccess =  createAction(FETCH_TOKEN_SUCCESS)
