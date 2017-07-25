const sinon = require('sinon')
const request = require('request')
const utils = require('../../common/utils')
const jsonApi = require('../../common/jsonapi')
const authRoute = require('../../server/routes/auth')
const UserModel = require('../../models/UserModel')
const sinonStubPromise = require('sinon-stub-promise')

sinonStubPromise(sinon)

describe('Auth Route', () => {
	describe('/POST authorization', () => {
		let loggerInfoStub, loggerErrorStub, res

		beforeEach(() => {
			loggerInfoStub = sinon.stub(utils.logger, 'info', () => { })
			loggerErrorStub = sinon.stub(utils.logger, 'error', () => { })

			res = {
				send: sinon.stub().returnsThis(),
				status: sinon.stub().returnsThis()
			}
		})

		afterEach(() => {
			loggerInfoStub.restore()
			loggerErrorStub.restore()
		})

		it('responds with a 422 http status code if the request body is empty', () => {
			let req = {}

			authRoute.post(req, res)

			sinon.assert.calledWith(res.status, 422)
		})

		it('responds with a 500 http status code if the JSON API serialization throws an error', () => {
			let req = {
				body: {
					'data': {
						'type': 'authorizations',
						'id': '1',
						'attributes': {
							'code': 'some-code'
						}
					}
				}
			}

			const promiseStub = sinon.stub(jsonApi.authorizationDeserializer, 'deserialize').returnsPromise()
			promiseStub.rejects('some error')

			authRoute.post(req, res)

			promiseStub.restore()
			sinon.assert.calledWith(res.status, 500)
		})

		it('responds with a 500 http status code if the OATH Token request fails', () => {
			let req = {
				body: {
					'data': {
						'type': 'authorizations',
						'id': '1',
						'attributes': {
							'code': 'some-code'
						}
					}
				}
			}

			const promiseStub = sinon.stub(jsonApi.authorizationDeserializer, 'deserialize').returnsPromise()
			promiseStub.resolves({ code : 'some-code' })

			const requestStub = sinon.stub(request, 'post').yields('some error', null, null)

			authRoute.post(req, res)

			promiseStub.restore()
			requestStub.restore()
			sinon.assert.calledWith(res.status, 500)
		})

		it('responds with a 200 http status code if the OATH Token request is successful', () => {
			let req = {
				body: {
					'data': {
						'type': 'authorizations',
						'id': '1',
						'attributes': {
							'code': 'some-code'
						}
					}
				}
			}

			let oathBody = '{ "access_token": "some-token", "user": { "id": "some-id", "username": "some-name" } }'

			const promiseStub = sinon.stub(jsonApi.authorizationDeserializer, 'deserialize').returnsPromise()
			promiseStub.resolves({ code : 'some-code' })

			const requestStub = sinon.stub(request, 'post').yields(null, { statusCode: 200, body: oathBody }, oathBody)
			const saveStub = sinon.stub(UserModel.prototype, 'save').yields(null)

			authRoute.post(req, res)

			promiseStub.restore()
			requestStub.restore()
			saveStub.restore()
			sinon.assert.calledWith(res.status, 200)
		})

		it('responds with a 500 http status code of the user save operation fails', () => {
			let req = {
				body: {
					'data': {
						'type': 'authorizations',
						'id': '1',
						'attributes': {
							'code': 'some-code'
						}
					}
				}
			}

			let oathBody = '{ "access_token": "some-token", "user": { "id": "some-id", "username": "some-name" } }'

			const promiseStub = sinon.stub(jsonApi.authorizationDeserializer, 'deserialize').returnsPromise()
			promiseStub.resolves({ code : 'some-code' })

			const requestStub = sinon.stub(request, 'post').yields(null, { statusCode: 200 }, oathBody)
			const saveStub = sinon.stub(UserModel.prototype, 'save').yields('some error')

			authRoute.post(req, res)

			promiseStub.restore()
			requestStub.restore()
			saveStub.restore()
			sinon.assert.calledWith(res.status, 500)
		})

		it('responds with the same http status code of the OATH Token request if it returns a 200 response', () => {
			let req = {
				body: {
					'data': {
						'type': 'authorizations',
						'id': '1',
						'attributes': {
							'code': 'some-code'
						}
					}
				}
			}

			const promiseStub = sinon.stub(jsonApi.authorizationDeserializer, 'deserialize').returnsPromise()
			promiseStub.resolves({ code : 'some-code' })

			const requestStub = sinon.stub(request, 'post').yields(null, { statusCode: 400 }, null)

			authRoute.post(req, res)

			promiseStub.restore()
			requestStub.restore()
			sinon.assert.calledWith(res.status, 400)
		})
	})
})
