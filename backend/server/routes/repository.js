const rp = require('request-promise-native')
const utils = require('../../common/utils')
const Error = require('../../common/error')
const HttpStatus = require('../../common/constants').http

const queries = require('../../common/queries')

const getCommits = (req, res) => {
	let query = queries.getQuery('repo-commits')

	if (!query) {
		res.status(HttpStatus.internalError).send({
			detail: 'Internal server error',
			status: HttpStatus.internalError
		})
		return
	}

	if (!req.params.owner || !req.params.name) {
		utils.logger.error({ error: `repository.getCommits() error, parameter ${!req.params.owner ? `owner` : `name`} does not exist`, request: req })

    const errorResponse = new Error({
      detail: `The request has no ${!req.params.owner ? `owner` : `name`} parameter`,
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
    utils.logger.info({ payload: json, request: req })

    const commits = {
      type: 'commit',
      data: json.data.repository.ref.target.history.edges
    }

    res.status(HttpStatus.ok).send(commits)
  })
  .catch(error => {
    utils.logger.info({ error: error, request: req })

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