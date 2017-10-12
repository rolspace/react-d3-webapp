import sinon from 'sinon'
import { expect } from 'chai'
import Cookies from 'js-cookie'
import { getUser, fetchUser } from '../../actions/user'
import { FETCH_USER, FETCH_USER_ERROR, FETCH_USER_SUCCESS } from '../../actions/user'

describe('Actions: User actions', () => {
	it('has an action to get the user and dispatches the FETCH_USER and FETCH_USER_SUCCESS actions if it is successful', () => {
		const dispatch = sinon.spy()
		const cookiesStub = sinon.stub(Cookies, 'get').returns('11111')

		getUser()(dispatch)

		cookiesStub.restore()

		expect(dispatch.firstCall.args[0]).to.deep.equal({ type: FETCH_USER })
		expect(dispatch.secondCall.args[0]).to.deep.equal({ type: FETCH_USER_SUCCESS, payload: { id: '11111', login: true } })
	})

	it('has an action to get the user and dispatches the FETCH_USER and FETCH_USER_ERROR actions if it is unsuccessful', () => {
		const dispatch = sinon.spy()
		const cookiesStub = sinon.stub(Cookies, 'get').returns('')

		getUser()(dispatch)

		cookiesStub.restore()

		expect(dispatch.firstCall.args[0]).to.deep.equal({ type: FETCH_USER })
		expect(dispatch.secondCall.args[0]).to.deep.equal({ type: FETCH_USER_ERROR })
	})
})