import 'whatwg-fetch'
import { createAction } from 'redux-actions'
import * as types from './repoTypes'

export const fetchRepo = (owner, name, token) => {
  return (dispatch) => {
    dispatch(fetchingRepo())

    return fetch(`${process.env.BACKEND_URL}/api/repo/${owner}/${name}/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        token: token
      })
    })
      .then(response => {
        if (response.status === 200) {
          return response.json()
        } else {
          dispatch(fetchRepoError())
        }
      })
      .then(json => {
        return json
      })
      .then(result => {
        const payload = {
          owner: owner,
          name: name,
          data: result.data
        }
        dispatch(fetchRepoSuccess(payload))
      })
      .catch(error => {
        dispatch(fetchRepoError(error))
      })
  }
}

export const changeRepo = (owner, name) => {
  return (dispatch) => {
    dispatch(changingRepo())

    const payload = {
      owner: owner,
      name: name
    }

    dispatch(changeRepoSuccess(payload))
  }
}

const fetchingRepo = createAction(types.FETCHING_REPO)
const fetchRepoError = createAction(types.FETCH_REPO_ERROR)
const fetchRepoSuccess = createAction(types.FETCH_REPO_SUCCESS)
const changingRepo = createAction(types.CHANGING_REPO)
const changeRepoSuccess = createAction(types.CHANGE_REPO_SUCCESS)