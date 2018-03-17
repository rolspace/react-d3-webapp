const sinon = require('sinon')
const rp = require('request-promise-native')
const utils = require('../../common/utils')
const repository = require('../../server/routes/repository')
const sinonStubPromise = require('sinon-stub-promise')

sinonStubPromise(sinon);

describe('repository module', () => {
  beforeEach(() => {
    loggerStubInfo = sinon.stub(utils.logger, 'info', () => { })
    loggerStubError = sinon.stub(utils.logger, 'error', () => { })

    res = {
      send: sinon.stub().returnsThis(),
      status: sinon.stub().returnsThis()
    };
  })

  afterEach(() => {
    loggerStubInfo.restore()
    loggerStubError.restore()
  })

  it('creates an HTTP 200 response if there a valid response', () => {
    let req = {
      params: { repo: 'test' }
    }

    const rpStub = sinon.stub(rp, 'post').returnsPromise()
    rpStub.resolves('correct data')

    repository.getCommits(req, res)

    rpStub.restore()

    sinon.assert.calledWith(res.status, 200)
  })

  it('creates an HTTP 422 response if the repo parameter is not in the request body', () => {
    let req = {}

    repository.getCommits(req, res)

    sinon.assert.calledWith(res.status, 422)
  })

  it('creates an HTTP 500 response if there an error retrieving the external data', () => {
    let req = {
      params: { repo: 'test' }
    }

    const rpStub = sinon.stub(rp, 'post').returnsPromise()
    rpStub.rejects('some error')

    repository.getCommits(req, res)

    rpStub.restore()

    sinon.assert.calledWith(res.status, 500)
  })
})