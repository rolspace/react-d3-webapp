const rp = require('request-promise-native')
const utils = require('../../common/utils')
const Error = require('../../common/error')
const HttpStatus = require('../../common/constants').http

const queries = require('../../common/queries')
const logger = utils.logger

const getCommits = (req, res) => {
	// if (req.params.name === 'react') {
	// 	const reactData = require('../../examples/react.json')
	// 	res.status(HttpStatus.ok).send(reactData)
	// 	return
	// }
	// else if (req.params.name === 'depstime') {
	// 	const depsData = require('../../examples/depstime.json')
	// 	res.status(HttpStatus.ok).send(depsData)
	// 	return
	// }
	
	const query = queries.getQuery('repo-commits')
	
	if (!query) {
		logger.error({ message: 'repository.getCommits() error: query repo-commits does not exist' })
		const errorResponse = new Error({
			detail: 'Internal server error',
			status: HttpStatus.internalError
		})
		
		res.status(errorResponse.status).send(errorResponse)
		return
	}
	
	if (!req.params.owner || !req.params.name) {
		logger.error({ message: `repository.getCommits() error: parameter ${!req.params.owner ? 'owner' : 'name'} does not exist`, request: req })
		const errorResponse = new Error({
			detail: `No value for the ${!req.params.owner ? 'owner' : 'name'} parameter`,
			status: HttpStatus.unprocessable
		})
		
		res.status(errorResponse.status).send(errorResponse)
		return
	}
	
	const options = {
		uri: 'https://api.github.com/graphql',
		headers: {
			'Authorization': `bearer ${process.env.GITHUB_TOKEN}`,
			'User-Agent': `${process.env.GITHUB_USER}`
		},
		method: 'POST',
		body: {
			'query': query.data.replace('%NAME%', req.params.name).replace('%OWNER%', req.params.owner)
		},
		json: true
	}
	
	rp.post(options)
	.then(json => {
		logger.info({ message: 'repository.getCommits() info: Github request successful', payload: json, request: req })
		
		const commits = {
			type: 'commit',
			data: json.data.repository.ref.target.history.edges
		}
		
		res.status(HttpStatus.ok).send(commits)
	})
	.catch(error => {
		logger.error({ message: 'repository.getCommits() error: Github request unsuccessful', error: error, request: req })
		
		const errorResponse = new Error({
			detail: 'Internal server error',
			status: HttpStatus.internalError
		})
		
		res.status(HttpStatus.internalError).send(errorResponse)
	})
}

module.exports = {
	getCommits
}