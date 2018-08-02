import _ from 'lodash'
import GroupData from '../common/groupData'
import { FETCHING_REPOSITORY, FETCH_REPOSITORY_ERROR, FETCH_REPOSITORY_SUCCESS, CHANGING_REPOSITORY, CHANGE_REPOSITORY_SUCCESS } from '../actions/repo'

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
		case FETCHING_REPOSITORY:
      return _.merge({}, state, {
        isComplete: false,
        isFetching: true
      })
		case FETCH_REPOSITORY_ERROR:
      return _.merge({}, state, {
        error: 'some error',
        isComplete: true,
        isFetching: false,
      })
		case FETCH_REPOSITORY_SUCCESS: {
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
		case CHANGING_REPOSITORY: {
			return initialState
		}
		case CHANGE_REPOSITORY_SUCCESS:
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