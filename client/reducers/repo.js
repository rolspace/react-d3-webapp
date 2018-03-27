import { FETCH_REPO, FETCH_REPO_ERROR, FETCH_REPO_SUCCESS } from '../actions/repo';

const initialState = {
	data: {
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
			});
		case FETCH_REPO_ERROR:
			return Object.assign({}, state, {
				error: 'some error',
				isComplete: true,
				isFetching: false,
			});
		case FETCH_REPO_SUCCESS:
			return Object.assign({}, state, {
				data: transform(action.payload.data),
				isComplete: true,
				isFetching: false
			});
		default:
			return state;
	}
}

function transform(commits) {
	const ranges = {
		additions: initRanges([], 50),
		deletions: initRanges([], 50)
	}

	if (commits && commits.length) {
		const grouping = commits.reduce((accumulator, value) => {
			accumulator = assignToRange(accumulator, 'additions', value)
			accumulator = assignToRange(accumulator, 'deletions', value)

			return accumulator
		}, ranges)

		return grouping
	}
}

function initRanges(array, step) {
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

function assignToRange(object, property, value) {
	let found = object[property].find((element) => element.min < value.node[property] && element.max > value.node[property])

	if (found) {
		found.count++
	}

	return object
}

export default repo;