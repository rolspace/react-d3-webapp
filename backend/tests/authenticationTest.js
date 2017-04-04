const sinon = require('sinon');
const authentication = require('../server/routes/authentication');

describe('/POST authentication', () => {
	it('returns a 422 http status if the request body or the code parameter is empty', () => {
		let req = {};
		let res = {
			send: sinon.stub().returnsThis(),
			status: sinon.stub().returnsThis()
		};

		authentication.post(req, res);

		sinon.assert.calledWith(res.status, 422);
	});
});