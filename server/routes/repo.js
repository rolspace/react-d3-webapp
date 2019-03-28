const rp = require('request-promise-native')

const utils = require('../common/utils')
const queries = require('../common/queries')
const ServerError = require('../common/error')
const httpStatus = require('../common/constants').http

const logger = utils.logger

const getCommits = (req, res) => {	
	const query = queries.getQuery('repo-commits')
	if (!query) {
		logger.error({ message: 'repo.getCommits() error: query repo-commits does not exist' })
		const serverError = new ServerError({
			message: 'Internal server error',
			status: httpStatus.internalError
		})
		
		return res.status(serverError.status).send(serverError)
	}

	const { owner, name } = req.params

	if (!owner || !name) {
		logger.error({ message: `repo.getCommits() error: parameter ${!owner ? 'owner' : 'name'} does not exist`, request: req })
		const serverError = new ServerError({
			message: `The ${!owner ? 'owner' : 'name'} parameter is empty`,
			status: httpStatus.unprocessable
		})
		
		return res.status(serverError.status).send(serverError)
	}

	const { token } = req.body

	if (!token) {
		logger.error({ message: 'repo.getCommits() error: token not provided', request: req })
		const serverError = new ServerError({
			message: 'Token not provided',
			status: httpStatus.unprocessable
		})
		
		return res.status(serverError.status).send(serverError)	
	}
	
	const options = {
		method: 'POST',
		uri: 'https://api.github.com/graphql',
		json: true,
		headers: {
			'Authorization': `bearer ${token}`,
			'User-Agent': `${process.env.GITHUB_USER}`
		},
		body: { 'query': query.data.replace('%NAME%', req.params.name).replace('%OWNER%', req.params.owner) },
	}
	
	rp.post(options)
	.then(json => {
		logger.info({ message: 'repo.getCommits() info: Github request successful', payload: json, request: req })
		
		const commits = {
			type: 'commit',
			data: json.data.repository.ref.target.history.edges
		}
		
		res.status(httpStatus.ok).send(commits)
	})
	.catch(error => {
		logger.error({ message: 'repo.getCommits() error: Github request failed', error: error, request: req })
		
		const serverError = new ServerError({
			message: 'Internal server error',
			status: httpStatus.internalError
		})
		
		res.status(serverError.status).send(serverError)
	})
}

module.exports = {
	getCommits
}