const sinon = require('sinon');
const request = require('request');
const utils = require('../../common/utils');
const jsonApi = require('../../common/jsonapi');
const userModel = require('../../models/userModel');
const authorizationRoute = require('../../server/routes/authorization');
const sinonStubPromise = require('sinon-stub-promise');

sinonStubPromise(sinon);

describe('/POST authorization', () => {
	beforeEach(() => {
		//stub logger to prevent console messages
		loggerStub = sinon.stub(utils.logger, 'info', () => { });

		res = {
			send: sinon.stub().returnsThis(),
			status: sinon.stub().returnsThis()
		};
	});

	afterEach(() => {
		//restore logger
		loggerStub.restore();
	});

	it('returns a 422 http status if the request body is empty', () => {
		let req = {};

		authorizationRoute.post(req, res);

		sinon.assert.calledWith(res.status, 422);
	});

	it('returns a 500 http status if the JSON API serialization throws an error', () => {
		let req = {
			body: {
				"data": {
					"type": "authorizations",
					"id": "1",
					"attributes": {
						"code": "some-code"
					}
				}
			}
		};

		const promiseStub = sinon.stub(jsonApi.authorizationDeserializer, 'deserialize').returnsPromise();
		promiseStub.rejects('some error');
		
		authorizationRoute.post(req, res);

		promiseStub.restore();
		sinon.assert.calledWith(res.status, 500);
	});

	it('returns a 500 http status if the OATH Token request fails', () => {
		let req = {
			body: {
				"data": {
					"type": "authorizations",
					"id": "1",
					"attributes": {
						"code": "some-code"
					}
				}
			}
		};

		const promiseStub = sinon.stub(jsonApi.authorizationDeserializer, 'deserialize').returnsPromise();
		promiseStub.resolves({ code : 'some-code' });

		const requestStub = sinon.stub(request, 'post').yields('some error', null, null);

		authorizationRoute.post(req, res);

		promiseStub.restore();
		requestStub.restore();
		sinon.assert.calledWith(res.status, 500);
	});

	it('returns a 200 http status if the OATH Token request is successful', () => {
		let req = {
			body: {
				"data": {
					"type": "authorizations",
					"id": "1",
					"attributes": {
						"code": "some-code"
					}
				}
			}
		};

		let oathBody = '{ "access_token": "some-token", "user": { "id": "some-id", "username": "some-name" } }';

		const promiseStub = sinon.stub(jsonApi.authorizationDeserializer, 'deserialize').returnsPromise();
		promiseStub.resolves({ code : 'some-code' });

		const requestStub = sinon.stub(request, 'post').yields(null, { statusCode: 200, body: oathBody }, oathBody);
		const saveStub = sinon.stub(userModel.prototype, "save").yields(null);

		authorizationRoute.post(req, res);

		promiseStub.restore();
		requestStub.restore();
		saveStub.restore();
		sinon.assert.calledWith(res.status, 200);
	});

	it('returns a 500 http status if the user save operation fails', () => {
		let req = {
			body: {
				"data": {
					"type": "authorizations",
					"id": "1",
					"attributes": {
						"code": "some-code"
					}
				}
			}
		};

		let oathBody = '{ "access_token": "some-token", "user": { "id": "some-id", "username": "some-name" } }';

		const promiseStub = sinon.stub(jsonApi.authorizationDeserializer, 'deserialize').returnsPromise();
		promiseStub.resolves({ code : 'some-code' });

		const requestStub = sinon.stub(request, 'post').yields(null, { statusCode: 200 }, oathBody);
		const saveStub = sinon.stub(userModel.prototype, "save").yields('some error');

		authorizationRoute.post(req, res);

		promiseStub.restore();
		requestStub.restore();
		saveStub.restore();
		sinon.assert.calledWith(res.status, 500);
	});

	it('returns the http status of the OATH Token request if it is not a 200 response', () => {
		let req = {
			body: {
				"data": {
					"type": "authorizations",
					"id": "1",
					"attributes": {
						"code": "some-code"
					}
				}
			}
		};

		const promiseStub = sinon.stub(jsonApi.authorizationDeserializer, 'deserialize').returnsPromise();
		promiseStub.resolves({ code : 'some-code' });

		const requestStub = sinon.stub(request, 'post').yields(null, { statusCode: 400 }, null);

		authorizationRoute.post(req, res);

		promiseStub.restore();
		requestStub.restore();
		sinon.assert.calledWith(res.status, 400);
	});
});