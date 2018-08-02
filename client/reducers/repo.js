import _ from 'lodash'
import GroupData from '../common/groupData'
import * as types from '../actions/repoTypes'

const initialState = {
	data: {
		owner: '',
		name: '',
		lastId: '',
		lastDate: '',
		changedFiles: [],
		linesAdded: [],
		linesDeleted: []
	},
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
				data: {
					owner: action.payload.owner,
					name: action.payload.name,
					lastId: data.length ? data[0].node.oid : '',
					lastDate: data.length ? data[0].node.pushedDate : '',
					changedFiles: groupData.createSmallGroup(data, 'changedFiles'),
					linesAdded: groupData.createLargeGroup(data, 'additions'),
					linesDeleted: groupData.createLargeGroup(data, 'deletions')
				},
				isComplete: true,
				isFetching: false
			})
		}
		case types.CHANGING_REPOSITORY: {
			return initialState
		}
		case types.CHANGE_REPOSITORY_SUCCESS:
      return _.merge({}, state, {
        data: {
          owner: action.payload.owner,
          name: action.payload.name
        }
      })
		default:
      return state
	}
}

export default repo