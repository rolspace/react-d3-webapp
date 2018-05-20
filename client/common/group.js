import _ from 'lodash'

const Groups = {
	SMALL: Symbol('small'),
	LARGE: Symbol('large')
}

const smallGroup = [
	{ min: 1, max: 1, count:0, label: '1' },
	{ min: 2, max: 2, count:0, label: '2' },
	{ min: 3, max: 3, count:0, label: '3' },
	{ min: 4, max: 4, count:0, label: '4' },
	{ min: 5, max: 5, count:0, label: '5' },
	{ min: 6, max: 10, count:0, label: '6-10' },
	{ min: 11, max: 20, count:0, label: '11-20' },
	{ min: 21, max: 30, count:0, label: '21-30' },
	{ min: 30, max: 10000, count:0, label: '30+' }
]

const largeGroup = [
	{ min: 1, max: 20, count:0, label: '1-20' },
	{ min: 21, max: 40, count:0, label: '21-40' },
	{ min: 41, max: 60, count:0, label: '41-60' },
	{ min: 61, max: 80, count:0, label: '61-80' },
	{ min: 81, max: 100, count:0, label: '81-100' },
	{ min: 101, max: 500, count:0, label: '101-500' },
	{ min: 501, max: 1000, count:0, label: '501-1000' },
	{ min: 1001, max: 1500, count:0, label: '1001-1500' },
	{ min: 1500, max: 10000, count:0, label: '1500+' }
]

function assignToGroup(group, property, value) {
	let found = group.find((range) => range.min <= value.node[property] && range.max >= value.node[property])

	if (found) {
		found.count++
	}

	return group
}

function createGroup(collection, property, groupType) {
	const initialGroup = _.cloneDeep(groupType == Groups.SMALL ? [...smallGroup] : [...largeGroup])

	if (collection && collection.length) {
		const updatedGroup = collection.reduce((group, value) => {
			group = assignToGroup(group, property, value)
			return group
		}, initialGroup)

		return updatedGroup
	}

	return initialGroup
}

class Group {
	createSmallGroup(collection, property) {
		const group = createGroup(collection, property, Groups.SMALL)
		return group
	}

	createLargeGroup(collection, property) {
		const group = createGroup(collection, property, Groups.LARGE)
		return group
	}
}

export default Group