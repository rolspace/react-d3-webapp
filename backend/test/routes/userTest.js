const sinon = require('sinon');
const request = require('request');
const utils = require('../../common/utils');
const jsonApi = require('../../common/jsonapi');
const userModel = require('../../models/userModel');
const userRoute = require('../../server/routes/user');
const sinonStubPromise = require('sinon-stub-promise');

sinonStubPromise(sinon);

describe('/GET user', () => {
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

	it('returns a 422 http status if the id parameter is empty', () => {
		let req = {};

		userRoute.get(req, res);

		sinon.assert.calledWith(res.status, 422);
	});
});