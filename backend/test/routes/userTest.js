const sinon = require('sinon');
const request = require('request');
const utils = require('../../common/utils');
const jsonApi = require('../../common/jsonapi');
const usersRoute = require('../../server/routes/users');
const UserModel = require('../../models/UserModel');
const sinonStubPromise = require('sinon-stub-promise');

sinonStubPromise(sinon);

describe('User Route', () => {
	let res, loggerStubInfo, loggerStubError;

	beforeEach(() => {
			//stub logger to prevent console messages
			loggerStubInfo = sinon.stub(utils.logger, 'info', () => { });
			loggerStubError = sinon.stub(utils.logger, 'error', () => { });

			res = {
				send: sinon.stub().returnsThis(),
				status: sinon.stub().returnsThis()
			};
		})

	afterEach(() => {
			//restore logger
			loggerStubInfo.restore();
			loggerStubError.restore();
		})

	describe('/GET user', () => {
		it('returns a 422 http status when the id parameter is empty', () => {
			let req = {};

			usersRoute.get(req, res);

			sinon.assert.calledWith(res.status, 422);
		})

		it('returns a 200 http status when the user exists', () => {
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

			usersRoute.get(req, res);
			findOnePromiseStub.restore();

			sinon.assert.calledWith(res.status, 200);
		})

		it('returns a 500 http status when the user does not exist', () => {
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

			usersRoute.get(req, res);
			findOnePromiseStub.restore();

			sinon.assert.calledWith(res.status, 404);
		})
	})
})