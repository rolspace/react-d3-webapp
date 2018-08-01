import { createAction } from 'redux-actions'
import 'whatwg-fetch'

export const FETCHING_REPO = 'FETCHING_REPO'
export const FETCH_REPO_ERROR = 'FETCH_REPO_ERROR'
export const FETCH_REPO_SUCCESS = 'FETCH_REPO_SUCCESS'
export const UPDATING_REPO = 'UPDATING_REPO'
export const UPDATE_REPO_SUCCESS = 'UPDATE_REPO_SUCCESS'

export const getRepo = (owner, name) => {
	return (dispatch) => {
		dispatch(fetchingRepo())
		return fetch(`${process.env.BACKEND_URL}/api/repository/commits/${owner}/${name}/`)
    .then(response => {
      if (response.status === 200) {
        return response.json()
      }
      else {
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

export const updateRepo = (owner, name) => {
	return (dispatch) => {
		dispatch(updatingRepo())
    
		const payload = {
			owner: owner,
			name: name
		}
    
		dispatch(updateRepoSuccess(payload))
	}
}

const fetchingRepo = createAction(FETCHING_REPO)
const fetchRepoError = createAction(FETCH_REPO_ERROR)
const fetchRepoSuccess = createAction(FETCH_REPO_SUCCESS)
const updatingRepo = createAction(UPDATING_REPO)
const updateRepoSuccess = createAction(UPDATE_REPO_SUCCESS)