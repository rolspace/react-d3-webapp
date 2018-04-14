import { FETCH_REPO, FETCH_REPO_ERROR, FETCH_REPO_SUCCESS, UPDATE_REPO_SUCCESS } from '../actions/repo'

const initialState = {
	data: {
		repo: 'react',
		owner: 'facebook',
		additions: [],
		deletions: []
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
		case FETCH_REPO_SUCCESS:
			return Object.assign({}, state, {
				data: {
					owner: action.payload.owner,
					repo: action.payload.repo,
					additions: groupData(action.payload.data, 'additions'),
					deletions: groupData(action.payload.data, 'deletions')
				},
				isComplete: true,
				isFetching: false
			})
		case UPDATE_REPO_SUCCESS:
			return Object.assign({}, state, {
				data: {
					owner: action.payload.owner,
					repo: action.payload.repo,
					additions: [],
					deletions: []
				}
			})
		default:
			return state
	}
}

function groupData(commits, type) {
	const group = initGroup([], 50)

	if (commits && commits.length) {
		const grouping = commits.reduce((accumulator, value) => {
			accumulator = assignToGroup(accumulator, type, value)

			return accumulator
		}, group)

		return grouping
	}

	return group
}

function initGroup(array, step) {
	let i = -1;

	while (i < 200) {
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

function assignToGroup(group, property, value) {
	let found = group.find((element) => element.min < value.node[property] && element.max > value.node[property])

	if (found) {
		found.count++
	}

	return group
}

export default repo