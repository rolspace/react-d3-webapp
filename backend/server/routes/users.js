const utils = require('../../common/utils')
const jsonapi = require('../../common/jsonapi')
const UserModel = require('../../models/UserModel')
const HttpStatus = require('../../common/constants').http

function getUser(req, res) {
	if (!req.params || !req.params.id) {
		utils.logger.error(`POST User, error, params empty: ${req}`)
		res.status(HttpStatus.unprocessable).send(new jsonapi.Error({ detail: 'The id parameter is empty' }))
	}
	else {
		UserModel.findOne({ 'id': req.params.id  })
		.then(data => {
			if (data) {
				utils.logger.info(`GET User, user found: ${data}`)

				const user = {
					id: data.id,
					username: data.username
				};

				res.status(HttpStatus.ok).send(jsonapi.serialize(jsonapi.types.users, user))
			}
			else {
				utils.logger.info(`GET User, user not found: ${req}`)
				res.status(HttpStatus.notFound).send(new jsonapi.Error({ detail: 'User not found' }))
			}
		})
		.catch(error => {
			utils.logger.error(`GET User, general error: ${error}`)
			res.status(HttpStatus.internalError).send(new jsonapi.Error({ detail: 'Internal server error' }))
		})
	}
}

function postUser(req, res) {
	if (!req.body) {
		utils.logger.error(`POST User, error, payload empty: ${req}`)
		res.status(HttpStatus.unprocessable).send(new jsonapi.Error({ detail: 'The request payload is empty' }))
	}
	else
	{
		utils.logger.info(res.body)
		const body = JSON.parse(res.body)

		const user = new UserModel({
			id: body.user.id,
			token: body.access_token,
			username: body.user.username
		})

		UserModel.findOne({ 'id': body.user.id  })
		.then(data => {
			utils.logger.info(`POST User, user found: ${data}`)

			let id = ''
			if (data) {
				id = data._id
				delete data._id

				data.token = body.access_token
				data.token_date = Date.now()
			}
			else {
				utils.logger.info(`POST User, new user: ${data}`)

				id = user._id;
				data = user;
			}

			UserModel.update({ _id: id }, data, { upsert: true, setDefaultsOnInsert: true })
			.then(result => {
				utils.logger.info(`POST User, update result: ${result}`)
				res.status(HttpStatus.ok).send(jsonapi.serialize(jsonapi.types.users, { id: data.id }))
			})
			.catch(error => {
				throw new Error(error)
			})
		})
		.catch(error => {
			utils.logger.error(`POST User, general error: ${error}`)
			res.status(HttpStatus.internalError).send(new jsonapi.Error({ detail: 'Internal server error' }))
		})
	}
}

module.exports = {
	get: getUser,
	post: postUser
}
