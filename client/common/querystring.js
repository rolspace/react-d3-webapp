import qs from 'query-string'

const parse = (value) => {
	if (value) {
		return qs.parse(value)
	}

	return {}
}

module.exports = {
	parse: parse
}