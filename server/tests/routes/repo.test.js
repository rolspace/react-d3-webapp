const chai = require('chai')
const sinon = require('sinon')
const sinonChai = require('sinon-chai')
const rp = require('request-promise-native')
const queries = require('../../common/queries')
const utils = require('../../common/utils')
const repo = require('../../routes/repo')

const expect = chai.expect
chai.use(sinonChai)

describe('repo module', () => {
  let res, rpStub

  beforeEach(() => {
    loggerStubInfo = sinon.stub(utils.logger, 'info').callsFake(() => { })
    loggerStubError = sinon.stub(utils.logger, 'error').callsFake(() => { })
    
    res = {
      send: sinon.stub().returnsThis(),
      status: sinon.stub().returnsThis()
    }
  })
  
  afterEach(() => {
    loggerStubInfo.restore()
    loggerStubError.restore()

    res = {}
  })
  
  it('responds with a 200 status code when the data is retrieved', async () => {
    const queriesStub = sinon.stub(queries, 'getQuery').returns({ data: "repository(name: \"%NAME%\", owner: \"%OWNER%\")" })

    const req = { params: { name: 'name', owner: 'owner' }, body: { token: 'token' } }
    
    const data = { data: { repository: { ref: { target: { history: { edges: [] }}}}}}
    rpStub =  sinon.stub(rp, 'post').resolves(data)
    
    await repo.getCommits(req, res)
    
    rpStub.restore()
    queriesStub.restore()
    
    expect(res.send).to.have.been.calledOnce
    expect(res.status).to.have.been.calledOnce
    expect(res.status).to.have.been.calledWith(200)
  })
  
  it('creates an HTTP 422 response if the name parameter is not in the request body', async () => {
    const queriesStub = sinon.stub(queries, 'getQuery').returns({ data: "repository(name: \"%NAME%\", owner: \"%OWNER%\")" })

    const req = { params: { owner: 'owner' } }
    
    await repo.getCommits(req, res)
    
    queriesStub.restore()
    
    expect(res.send).to.have.been.calledOnce
    expect(res.status).to.have.been.calledOnce
    expect(res.status).to.have.been.calledWith(422)
  })
  
  //TODO: this test fails for some reason I do not quite understand. I will need to revisit this to find a solution.
  it('creates an HTTP 500 response if there an error retrieving the external data', async () => {
    const queriesStub = sinon.stub(queries, 'getQuery').returns({ data: "repository(name: \"%NAME%\", owner: \"%OWNER%\")" })

    const req = { params: { name: 'name', owner: 'owner' }, body: { token: 'token' } }
    
    rpStub = sinon.stub(rp, 'post').rejects('error')
    
    await repo.getCommits(req, res)
    
    rpStub.restore()
    queriesStub.restore()
    
    expect(res.send).to.have.been.calledOnce
    expect(res.status).to.have.been.calledOnce
    expect(res.status).to.have.been.calledWith(500)
  })
})