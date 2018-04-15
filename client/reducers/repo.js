import { FETCH_REPO, FETCH_REPO_ERROR, FETCH_REPO_SUCCESS, UPDATE_REPO_SUCCESS } from '../actions/repo'

const initialState = {
	data: {
		owner: '',
		name: '',
		lastId: '',
		lastDate: '',
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
					linesAdded: groupData(data, 'additions'),
					linesDeleted: groupData(data, 'deletions')
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
					linesAdded: [],
					linesDeleted: []
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