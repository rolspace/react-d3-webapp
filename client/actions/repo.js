/* eslint-disable no-unused-vars */
/* eslint-disable no-console */

import { createAction } from 'redux-actions'
import 'whatwg-fetch'

export const FETCH_REPO = 'FETCH_REPO'
export const FETCH_REPO_ERROR = 'FETCH_REPO_ERROR'
export const FETCH_REPO_SUCCESS = 'FETCH_REPO_SUCCESS'

export function getRepoCommits() {
	return (dispatch) => {
		dispatch(fetchRepo())
		return fetch('http://localhost:4000/api/repository/commits/test/')
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
		.then(data => {
			dispatch(fetchRepoSuccess(data))
		})
		.catch(error => {
			dispatch(fetchRepoError())
		});
	}
}

const fetchRepo = createAction(FETCH_REPO)
const fetchRepoError = createAction(FETCH_REPO_ERROR)
const fetchRepoSuccess = createAction(FETCH_REPO_SUCCESS)