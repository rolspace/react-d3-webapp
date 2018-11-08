import 'whatwg-fetch'
import { createAction } from 'redux-actions'
import * as types from './repoTypes'

export const fetchRepository = (owner, name, token) => {
  return (dispatch) => {
    dispatch(fetchingRepository())

    return fetch(`${process.env.BACKEND_URL}/api/repository/commits/${owner}/${name}/`, {
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
          dispatch(fetchRepositoryError())
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
        dispatch(fetchRepositorySuccess(payload))
      })
      .catch(error => {
        dispatch(fetchRepositoryError(error))
      })
  }
}

export const changeRepository = (owner, name) => {
  return (dispatch) => {
    dispatch(changingRepo())

    const payload = {
      owner: owner,
      name: name
    }

    dispatch(changeRepoSuccess(payload))
  }
}

const fetchingRepository = createAction(types.FETCHING_REPOSITORY)
const fetchRepositoryError = createAction(types.FETCH_REPOSITORY_ERROR)
const fetchRepositorySuccess = createAction(types.FETCH_REPOSITORY_SUCCESS)
const changingRepo = createAction(types.CHANGING_REPOSITORY)
const changeRepoSuccess = createAction(types.CHANGE_REPOSITORY_SUCCESS)