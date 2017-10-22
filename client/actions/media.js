/* eslint-disable no-unused-vars */
/* eslint-disable no-console */

import { createAction } from 'redux-actions'
import 'whatwg-fetch'
import jsonapi from '../common/jsonapi'

export const FETCH_MEDIA = 'FETCH_MEDIA'
export const FETCH_MEDIA_ERROR = 'FETCH_MEDIA_ERROR'
export const FETCH_MEDIA_SUCCESS = 'FETCH_MEDIA_SUCCESS'

export function getMedia(id) {
	return (dispatch) => {
		dispatch(fetchMedia())
		return fetch(`http://localhost:4000/api/recent/${id}`)
		.then(response => {
			if (response.status === 200) {
				return response.json()
			}
			else {
				dispatch(fetchMediaError())
			}
		})
		.then(json => {
			return jsonapi.deserialize(json)
		})
		.then(data => {
			dispatch(fetchMediaSuccess(data))
		})
		.catch(error => {
			dispatch(fetchMediaError())
		});
	}
}

const fetchMedia = createAction(FETCH_MEDIA)
const fetchMediaError = createAction(FETCH_MEDIA_ERROR)
const fetchMediaSuccess = createAction(FETCH_MEDIA_SUCCESS)