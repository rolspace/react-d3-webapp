import { FETCH_MEDIA, FETCH_MEDIA_FAILURE, FETCH_MEDIA_SUCCESS } from '../actions/media';

const initialState = {
	data: [],
	error: null,
	isComplete: false,
	isFetching: false
}

const recentMedia = (state = initialState, action) => {
	switch (action.type) {
		case FETCH_MEDIA:
			return Object.assign({}, state, {
				isComplete: false,
				isFetching: true
			});
		case FETCH_MEDIA_FAILURE:
			return Object.assign({}, state, {
				error: 'some error',
				isComplete: true,
				isFetching: false,
			});
		case FETCH_MEDIA_SUCCESS:
			return Object.assign({}, state, {
				data: action.payload,
				isComplete: true,
				isFetching: false
			});
		default:
			return state;
	}
}

export default recentMedia;