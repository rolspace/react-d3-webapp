/* eslint-disable no-console */

import Group from '../common/group'
import { FETCH_REPO, FETCH_REPO_ERROR, FETCH_REPO_SUCCESS, UPDATE_REPO_SUCCESS } from '../actions/repo'

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
		case FETCH_REPO:
			return Object.assign({}, state, {
				isComplete: false,
				isFetching: true
			})
		case FETCH_REPO_ERROR:
			return Object.assign({}, state, {
				error: 'some error',
				isComplete: true,
				isFetching: false,
			})
		case FETCH_REPO_SUCCESS: {
			const group = new Group()
			const data = action.payload.data
			return Object.assign({}, state, {
				data: {
					owner: action.payload.owner,
					name: action.payload.name,
					lastId: data.length ? data[0].node.oid : '',
					lastDate: data.length ? data[0].node.pushedDate : '',
					changedFiles: group.createSmallGroup(data, 'changedFiles'),
					linesAdded: group.createLargeGroup(data, 'additions'),
					linesDeleted: group.createLargeGroup(data, 'deletions')
				},
				isComplete: true,
				isFetching: false
			})
		}
		case UPDATE_REPO_SUCCESS:
			return Object.assign({}, state, {
				data: {
					owner: action.payload.owner,
					name: action.payload.name,
					lastId: '',
					lastDate: '',
					changedFiles: [],
					linesAdded: [],
					linesDeleted: []
				}
			})
		default:
			return state
	}
}

export default repo