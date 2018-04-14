import { createAction } from 'redux-actions'
import 'whatwg-fetch'

export const FETCH_REPO = 'FETCH_REPO'
export const FETCH_REPO_ERROR = 'FETCH_REPO_ERROR'
export const FETCH_REPO_SUCCESS = 'FETCH_REPO_SUCCESS'
export const UPDATE_REPO_SUCCESS = 'UPDATE_REPO_SUCCESS'

export function getRepoCommits(owner, repo) {
	return (dispatch) => {
		dispatch(fetchRepo())
		return fetch(`http://localhost:4000/api/repository/commits/${owner}/${repo}/`)
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
				repo: repo,
				data: result.data
			}
			dispatch(fetchRepoSuccess(payload))
		})
		.catch(error => {
			dispatch(fetchRepoError(error))
		})
	}
}

export function updateRepo(owner, repo) {
	return (dispatch) => {
		const payload = {
			owner: owner,
			repo: repo
		}

		dispatch(updateRepoSuccess(payload))
	}
}

const fetchRepo = createAction(FETCH_REPO)
const fetchRepoError = createAction(FETCH_REPO_ERROR)
const fetchRepoSuccess = createAction(FETCH_REPO_SUCCESS)
const updateRepoSuccess = createAction(UPDATE_REPO_SUCCESS)