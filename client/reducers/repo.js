import _ from 'lodash'
import GroupData from '../common/groupData'
import * as types from '../actions/repoTypes'

const initialState = {
	commits: {
		changedFiles: [],
		linesAdded: [],
		linesDeleted: []
	},
	owner: '',
	name: '',
	isComplete: false,
	isFetching: false,
	error: null
}

const repo = (state = initialState, action) => {
	switch (action.type) {
		case types.FETCHING_REPOSITORY:
      return _.merge({}, state, {
        isComplete: false,
        isFetching: true
      })
		case types.FETCH_REPOSITORY_ERROR:
      return _.merge({}, state, {
        error: 'some error',
        isComplete: true,
        isFetching: false,
      })
		case types.FETCH_REPOSITORY_SUCCESS: {
			const groupData = new GroupData()
			const data = action.payload.data
			
			return _.merge({}, state, {
				commits: {
					changedFiles: groupData.createSmallGroup(data, 'changedFiles'),
					linesAdded: groupData.createLargeGroup(data, 'additions'),
					linesDeleted: groupData.createLargeGroup(data, 'deletions')
				},
				owner: action.payload.owner,
				name: action.payload.name,
				isComplete: true,
				isFetching: false
			})
		}
		case types.CHANGING_REPOSITORY: {
			return initialState
		}
		case types.CHANGE_REPOSITORY_SUCCESS:
      return _.merge({}, state, {
				owner: action.payload.owner,
				name: action.payload.name
      })
		default:
      return state
	}
}

export default repo