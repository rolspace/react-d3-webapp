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
			logger.error({ ns: `${ns}:post()` }, 'Query repo-commits does not exist')
			const serverError = new ServerError({
				message: 'Internal server error',
				status: httpStatus.internalError
			})
			
			return res.status(serverError.status).send(serverError)
		}

		const { owner, name } = req.params

		if (!owner || !name) {
			logger.error({ ns: `${ns}:post()` }, `Parameter ${!owner ? 'owner' : 'name'} is undefined`)
			const serverError = new ServerError({
				message: `Parameter ${!owner ? 'owner' : 'name'} is undefined`,
				status: httpStatus.unprocessable
			})
			
			return res.status(serverError.status).send(serverError)
		}

		const { token } = req.body

		if (!token) {
			logger.error({ ns: `${ns}:post` }, 'Token not provided')
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
		logger.info({ ns: `${ns}:post`, result: json }, 'Github request successful')

		const result = { data: json.data.repository.ref.target.history.edges }	
		res.status(httpStatus.ok).send(result)
	}
	catch (error) {
		logger.error({ ns: `${ns}:post`, error: error }, 'Github request failed')
		next(error)
	}
}

module.exports = {
	post
}