import { RECENT_MEDIA_FETCH, RECENT_MEDIA_FETCH_FAILURE, RECENT_MEDIA_FETCH_SUCCESS } from '../actions/media';

const initialState = {
	data: [],
	status: 'PENDING'
}

const recentMedia = (state = initialState, action) => {
	switch (action.type) {
		case RECENT_MEDIA_FETCH:
			return Object.assign({}, state, {
				status: 'FETCHING' 
			});
		case RECENT_MEDIA_FETCH_FAILURE:
			return Object.assign({}, state, {
				status: 'COMPLETE'
			});
		case RECENT_MEDIA_FETCH_SUCCESS:
			return Object.assign({}, state, {
				data: action.payload,
				status: 'COMPLETE'
			});
		default:
			return state;
	}
}

export default recentMedia;