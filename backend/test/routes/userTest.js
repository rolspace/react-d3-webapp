const sinon = require('sinon');
const request = require('request');
const utils = require('../../common/utils');
const jsonApi = require('../../common/jsonapi');
const UserModel = require('../../models/userModel');
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

	it('returns a 200 http status if the user id exists', () => {
		let req = {
			params: {
				id: 'some-id'
			}
		};

		let result = {
			id: 'some-id',
			username: 'some username'
		};

		const findOnePromiseStub = sinon.stub(UserModel, 'findOne').returnsPromise();
		findOnePromiseStub.resolves(result);

		userRoute.get(req, res);
		findOnePromiseStub.restore();

		sinon.assert.calledWith(res.status, 200);
	});

	it('returns a 500 http status if the user id does not exist', () => {
		let req = {
			params: {
				id: 'some-id'
			}
		};

		let result = {
			id: 'some-id',
			username: 'some username'
		};

		const findOnePromiseStub = sinon.stub(UserModel, 'findOne').returnsPromise();
		findOnePromiseStub.rejects('Some error');

		userRoute.get(req, res);
		findOnePromiseStub.restore();

		sinon.assert.calledWith(res.status, 404);
	});
});