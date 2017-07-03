import { combineReducers } from 'redux';
import user from './user';
import recentMedia from './media';

const reducer = combineReducers({
	user,
	recentMedia
});

export default reducer;