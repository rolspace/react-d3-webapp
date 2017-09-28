/* eslint-disable no-unused-vars */
/* eslint-disable no-console */

import { createAction } from 'redux-actions';
import 'whatwg-fetch';
import jsonapi from '../common/jsonapi';

export const FETCH_MEDIA = 'FETCH_MEDIA';
export const FETCH_MEDIA_SUCCESS = 'FETCH_MEDIA_SUCCESS';
export const FETCH_MEDIA_FAILURE = 'FETCH_MEDIA_FAILURE';

export function getMedia(id) {
	return (dispatch) => {
		fetch(`http://localhost:4000/api/recent/${id}`)
		.then(response => {
			if (response.status === 200) {
				return response.json();
			}
			else {
				dispatch(fetchMediaFailure());
			}
		})
		.then(json => {
			return jsonapi.deserialize(json);
		})
		.then(data => {
			console.log(data);
			dispatch(fetchMediaSuccess(data));
		})
		.catch(error => {
			dispatch(fetchMediaFailure());
		});
	}
}

const fetchMedia = createAction(FETCH_MEDIA);
const fetchMediaSuccess = createAction(FETCH_MEDIA_SUCCESS);
const fetchMediaFailure = createAction(FETCH_MEDIA_FAILURE);