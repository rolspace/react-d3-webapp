import { createAction } from 'redux-actions'
import 'whatwg-fetch'

export const FETCHING_REPOSITORY = 'FETCHING_REPOSITORY'
export const FETCH_REPOSITORY_ERROR = 'FETCH_REPOSITORY_ERROR'
export const FETCH_REPOSITORY_SUCCESS = 'FETCH_REPOSITORY_SUCCESS'
export const CHANGING_REPOSITORY = 'CHANGING_REPOSITORY'
export const CHANGE_REPOSITORY_SUCCESS = 'CHANGE_REPOSITORY_SUCCESS'

export const fetchRepository = (owner, name) => {
	return (dispatch) => {
		dispatch(fetchingRepository())
		return fetch(`${process.env.BACKEND_URL}/api/repository/commits/${owner}/${name}/`)
    .then(response => {
      if (response.status === 200) {
        return response.json()
      }
      else {
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

const fetchingRepository = createAction(FETCHING_REPOSITORY)
const fetchRepositoryError = createAction(FETCH_REPOSITORY_ERROR)
const fetchRepositorySuccess = createAction(FETCH_REPOSITORY_SUCCESS)
const changingRepo = createAction(CHANGING_REPOSITORY)
const changeRepoSuccess = createAction(CHANGE_REPOSITORY_SUCCESS)