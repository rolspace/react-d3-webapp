import { expect } from 'chai'
import sinon from 'sinon'
import configureMockStore from 'redux-mock-store'
import thunkMiddleware from 'redux-thunk'
import Cookies from 'js-cookie'
import jsonapi from '../../common/jsonapi'
import { authenticateUser, getUser } from '../../actions/user'
import { FETCH_USER, FETCH_USER_ERROR, FETCH_USER_SUCCESS,
	LOGIN_USER, LOGIN_USER_ERROR, LOGIN_USER_SUCCESS } from '../../actions/user'

const middlewares = [ thunkMiddleware ]
const mockStore = configureMockStore(middlewares)

describe('Actions: User actions', () => {
	it('has an action to get the user and dispatches the FETCH_USER and FETCH_USER_SUCCESS actions if it is successful', () => {
		const cookiesStub = sinon.stub(Cookies, 'get').returns('11111')
		const store = mockStore({ user: {} })

		store.dispatch(getUser())

		cookiesStub.restore()

		expect(store.getActions()).to.deep.equal([
			{ type: FETCH_USER },
			{ type: FETCH_USER_SUCCESS, payload: { id: '11111', login: true } }
		])
	})

	it('has an action to get the user and dispatches the FETCH_USER and FETCH_USER_ERROR actions if it is unsuccessful', () => {
		const cookiesStub = sinon.stub(Cookies, 'get').returns('')
		const store = mockStore({ user: {} })

		store.dispatch(getUser())

		cookiesStub.restore()

		expect(store.getActions()).to.deep.equal([
			{ type: FETCH_USER },
			{ type: FETCH_USER_ERROR }
		])
	})

	it('has an action to authorize the user and dispatches the LOGIN_USER and LOGIN_USER_SUCCESS actions if the authorization is successful', () => {
		const user = { type: 'users', id: '40815882' }

		const responseStub = { _bodyText: JSON.stringify(user), status: 200, json: () => JSON.stringify(user) }
		const jsonapiStub = sinon.stub(jsonapi, 'deserializer').returns(user)
		const fetchStub = sinon.stub(global, 'fetch').resolves(responseStub)

		const store = mockStore({ user: {} })

		return store.dispatch(authenticateUser('3fsd4etgi78fghr')).then(() => {
			fetchStub.restore()

			expect(store.getActions()).to.deep.equal([
				{ type: LOGIN_USER },
				{ type: LOGIN_USER_SUCCESS, payload: { id: '40815882', login: true } }
			])
		})
	})

	it('has an action to authorize the user and dispatches the LOGIN_USER and LOGIN_USER_ERROR actions if the authorization fails', () => {
		const store = mockStore({ user: {} })

		store.dispatch(authenticateUser(''))

		expect(store.getActions()).to.deep.equal([
			{ type: LOGIN_USER },
			{ type: LOGIN_USER_ERROR }
		])
	})
})