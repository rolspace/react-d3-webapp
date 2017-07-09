/* eslint-disable no-unused-vars */
/* eslint-disable no-console */

import { createAction } from 'redux-actions';
import 'whatwg-fetch';
import jsonapi from '../common/jsonapi';

export const RECENT_MEDIA_FETCH = 'RECENT_MEDIA_FETCH';
export const RECENT_MEDIA_FETCH_SUCCESS = 'RECENT_MEDIA_FETCH_SUCCESS';
export const RECENT_MEDIA_FETCH_FAILURE = 'RECENT_MEDIA_FETCH_FAILURE';

export function getRecentMedia(id) {
	return (dispatch) => {
		fetch(`http://localhost:4000/api/recent/${id}`)
		.then(response => {
			if (response.status === 200) {
				return response.json();
			}
			else {
				dispatch(fetchRecentMediaFailure());
			}
		})
		.then(json => {
			return jsonapi.deserialize(json);
		})
		.then(data => {
			console.log(data);
			dispatch(fetchRecentMediaSuccess(data));
		})
		.catch(error => {
			dispatch(fetchRecentMediaFailure());
		});
	}
}

const fetchRecentMedia = createAction(RECENT_MEDIA_FETCH);
const fetchRecentMediaSuccess = createAction(RECENT_MEDIA_FETCH_SUCCESS);
const fetchRecentMediaFailure = createAction(RECENT_MEDIA_FETCH_FAILURE);