import 'whatwg-fetch'
import { createAction } from 'redux-actions'
import * as types from './repoTypes'

export const fetchRepo = (owner, name, token) => {
  return async (dispatch) => {
    dispatch(fetchingRepo())

    try {
      const response = await fetch(`${process.env.SERVER_URL}/api/repo/${owner}/${name}/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          token: token
        })
      })

      const json = await response.json()
      const payload = { owner, name, data: json.data }

      dispatch(fetchRepoSuccess(payload))
    }
    catch(error) {
      dispatch(fetchRepoError(error))
    }
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
