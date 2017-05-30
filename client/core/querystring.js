import queryString from 'query-string';

const parse = (qs) => {
	if (qs) {
		return queryString.parse(qs);
	}

	return {};
}

module.exports = {
	parse: parse
}