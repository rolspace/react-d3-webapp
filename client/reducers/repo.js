/* eslint-disable no-console */

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
			const data = action.payload.data
			return Object.assign({}, state, {
				data: {
					owner: action.payload.owner,
					name: action.payload.name,
					lastId: data.length ? data[0].node.oid : '',
					lastDate: data.length ? data[0].node.pushedDate : '',
					changedFiles: groupData(data, 1, 'changedFiles'),
					linesAdded: groupData(data, 50, 'additions'),
					linesDeleted: groupData(data, 50, 'deletions')
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

function groupData(commits, step, type) {
	const max = commits.reduce((accumulator, value) => {
		console.log(Math.max(accumulator, value.node[type]))
		return Math.max(accumulator, value.node[type])
	}, 0)

	const correctedStep = (max / step) > 10 ? Math.trunc(max / 10) : step

	const group = initGroup([], correctedStep, max)

	if (commits && commits.length) {
		const grouping = commits.reduce((accumulator, value) => {
			accumulator = assignToGroup(accumulator, type, value)

			return accumulator
		}, group)

		return grouping
	}

	return group
}

function initGroup(array, step, max) {
	let i = -1;
	while (i < max) {
		let range = {
			min: i + 1,
			max: i + step,
			count: 0,
			label: `${i + 1}-${i + step}`
		}

		i = i + step

		array.push(range)
	}

	return array
}

function assignToGroup(group, type, value) {
	let found = group.find((element) => element.min < value.node[type] && element.max > value.node[type])
	if (found) {
		found.count++
	}

	return group
}

export default repo