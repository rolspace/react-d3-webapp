import _ from 'lodash'
import Range from '../common/range'
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
		case types.FETCHING_REPO:
      return _.merge({}, state, {
        isComplete: false,
        isFetching: true
      })
		case types.FETCH_REPO_ERROR:
      return _.merge({}, state, {
        error: 'some error',
        isComplete: true,
        isFetching: false,
      })
		case types.FETCH_REPO_SUCCESS: {
			const range = new Range()
			const data = action.payload.data
			
			return _.merge({}, state, {
				commits: {
					changedFiles: range.createLowRange(data, 'changedFiles'),
					linesAdded: range.createHighRange(data, 'additions'),
					linesDeleted: range.createHighRange(data, 'deletions')
				},
				owner: action.payload.owner,
				name: action.payload.name,
				isComplete: true,
				isFetching: false
			})
		}
		case types.CHANGING_REPO: {
			return initialState
		}
		case types.CHANGE_REPO_SUCCESS:
      return _.merge({}, state, {
				owner: action.payload.owner,
				name: action.payload.name
      })
		default:
      return state
	}
}

export default repo