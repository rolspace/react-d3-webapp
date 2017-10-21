import { FETCH_MEDIA, FETCH_MEDIA_ERROR, FETCH_MEDIA_SUCCESS } from '../actions/media';

const initialState = {
	items: [],
	isComplete: false,
	isFetching: false,
	error: null
}

const recentMedia = (state = initialState, action) => {
	switch (action.type) {
		case FETCH_MEDIA:
			return Object.assign({}, state, {
				isComplete: false,
				isFetching: true
			});
		case FETCH_MEDIA_ERROR:
			return Object.assign({}, state, {
				error: 'some error',
				isComplete: true,
				isFetching: false,
			});
		case FETCH_MEDIA_SUCCESS:
			return Object.assign({}, state, {
				items: action.payload,
				isComplete: true,
				isFetching: false
			});
		default:
			return state;
	}
}

export default recentMedia;