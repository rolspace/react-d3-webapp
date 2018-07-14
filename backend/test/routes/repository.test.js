const chai = require('chai')
const sinon = require('sinon')
const sinonChai = require('sinon-chai')
const rp = require('request-promise-native')
const utils = require('../../common/utils')
const repository = require('../../server/routes/repository')

const expect = chai.expect
chai.use(sinonChai)

let res, rpStub

describe('repository module', function() {
  beforeEach(function() {
    loggerStubInfo = sinon.stub(utils.logger, 'info').callsFake(() => { })
    loggerStubError = sinon.stub(utils.logger, 'error').callsFake(() => { })

    res = {
      send: sinon.stub().returnsThis(),
      status: sinon.stub().returnsThis()
    }
  })

  afterEach(function() {
    loggerStubInfo.restore()
    loggerStubError.restore()

    res = {}
  })

  it('creates an HTTP 200 response if there a valid response', async function() {
    const req = {
      params: { name: 'test', owner: 'test' }
    }

    const data = { data: { repository: { ref: { target: { history: { edges: [] }}}}}}
    rpStub =  sinon.stub(rp, 'post').resolves(data)

    await repository.getCommits(req, res)
    rpStub.restore()

    expect(res.send).to.have.been.calledOnce
    expect(res.status).to.have.been.calledOnce
    expect(res.status).to.have.been.calledWith(200)
  })

  it('creates an HTTP 422 response if the name parameter is not in the request body', async function() {
    const req = {
      params: { owner: 'test' }
    }

    await repository.getCommits(req, res)

    expect(res.send).to.have.been.calledOnce
    expect(res.status).to.have.been.calledOnce
    expect(res.status).to.have.been.calledWith(422)
  })

  //TODO: this test fails for some reason I do not quite understand. I will need to revisit this to find a solution.
  it('creates an HTTP 500 response if there an error retrieving the external data', async function() {
    const req = {
      params: { name: 'test1', owner: 'test1' }
    }

    rpStub = sinon.stub(rp, 'post').rejects('some error')

    await repository.getCommits(req, res)
    rpStub.restore()

    expect(res.send).to.have.been.calledOnce
    expect(res.status).to.have.been.calledOnce
    expect(res.status).to.have.been.calledWith(500)
  })
})