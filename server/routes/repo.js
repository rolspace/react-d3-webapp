const path = require('path')
const rp = require('request-promise-native')
const constants = require('../common/constants')
const ServerError = require('../common/error')
const logger = require('../common/logger')
const queries = require('../common/queries')

const ns = path.relative(process.cwd(), __filename)
const httpStatus = constants.http

const post = async (req, res, next) => {
	try {
		const query = queries.getQuery('repo-commits')
		if (!query) {
			logger.error({ ns: `${ns}:post()`, message: 'query repo-commits does not exist' })
			const serverError = new ServerError({
				message: 'Internal server error',
				status: httpStatus.internalError
			})
			
			return res.status(serverError.status).send(serverError)
		}

		const { owner, name } = req.params

		if (!owner || !name) {
			logger.error({ ns: `${ns}:post()`, message: `parameter ${!owner ? 'owner' : 'name'} is undefined`, request: req })
			const serverError = new ServerError({
				message: `parameter ${!owner ? 'owner' : 'name'} is undefined`,
				status: httpStatus.unprocessable
			})
			
			return res.status(serverError.status).send(serverError)
		}

		const { token } = req.body

		if (!token) {
			logger.error({ ns: `${ns}:post`, message: 'token not provided', request: req })
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
		
		const json = await rp.post(options)
		const result = { data: json.data.repository.ref.target.history.edges }
		
		logger.info({ ns: `${ns}:post`, message: 'Github request successful', result: json, request: req })
			
		res.status(httpStatus.ok).send(result)
	}
	catch (error) {
		logger.error({ ns: `${ns}:post`, message: 'Github request failed', error: error, request: req })
		next(error)
	}
}

module.exports = {
	post
}