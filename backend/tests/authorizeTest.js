const sinon = require('sinon');
const utils = require('../common/utils');
const jsonApi = require('../common/jsonapi');
const authorize = require('../server/routes/authorize');
const sinonStubPromise = require('sinon-stub-promise');

sinonStubPromise(sinon);

describe('/POST authorize', () => {
	beforeEach(() => {
		//stub logger to prevent console messages
		loggerStub = sinon.stub(utils.logger, 'info', () => { });
	});

	afterEach(() => {
		//restore logger
		loggerStub.restore();
	});

	it('returns a 422 http status if the request body or the code parameter is empty', () => {
		let req = {};
		let res = {
			send: sinon.stub().returnsThis(),
			status: sinon.stub().returnsThis()
		};

		authorize.post(req, res);

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

		let res = {
			send: sinon.stub().returnsThis(),
			status: sinon.stub().returnsThis()
		};

		const promiseStub = sinon.stub(jsonApi.authorizationDeserializer, 'deserialize').returnsPromise();
		promiseStub.rejects('Some Error');
		
		authorize.post(req, res);

		sinon.assert.calledWith(res.status, 500);
	});
});