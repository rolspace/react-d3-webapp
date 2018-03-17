const rp = require('request-promise-native')
const utils = require('../../common/utils')
const Error = require('../../common/error')
const HttpStatus = require('../../common/constants').http

const query = `{\n
  repository(name: \"react\", owner: \"facebook\") {\n
    ref(qualifiedName: \"master\") {\n
      target {\n
        ... on Commit {\n
          id\n
          history(first: 100) {\n
            pageInfo {\n
              hasNextPage\n
            }\n
            edges {\n
              node {\n
                author {\n
                  date\n
                }\n
              }\n
            }\n
          }\n
        }\n
      }\n
    }\n
  }\n
}`

function getCommits(req, res) {
	if (!req.params || !req.params.repo) {
		utils.logger.error({ error: `repository.getCommits() error, params empty: ${req}`, request: req })

    const errorResponse = new Error({
      detail: 'The request body has no repo parameter',
      status: HttpStatus.unprocessable
    })

		res.status(errorResponse.status).send(errorResponse)
	}
	else {
		const options = {
			uri: 'https://api.github.com/graphql',
			headers: {
				'Authorization': `bearer ${process.env.GITHUB_TOKEN}`,
        'User-Agent': `${process.env.GITHUB_USER}`
			},
			method: 'POST',
			body: {
				'query': query
			},
			json: true
		}

    rp.post(options)
    .then(json => {
      utils.logger.info({ payload: json, request: req });

      let commits = {
        type: 'commit',
        data: json.data.repository.ref.target.history.edges
      }
      res.status(HttpStatus.ok).send(commits)
    })
    .catch(error => {
      utils.logger.info({ error: error, request: req });

      const errorResponse = new Error({
        detail: 'Internal server error',
        status: HttpStatus.internalError
      })
      res.status(errorResponse.status).send(errorResponse)
    })
	}
}

module.exports = {
	getCommits: getCommits
}