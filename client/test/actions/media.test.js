import { expect } from 'chai'
import sinon from 'sinon'
import configureMockStore from 'redux-mock-store'
import thunkMiddleware from 'redux-thunk'
import jsonapi from '../../common/jsonapi'
import { getMedia } from '../../actions/media'
import { FETCH_MEDIA, FETCH_MEDIA_ERROR, FETCH_MEDIA_SUCCESS } from '../../actions/media'

const middlewares = [ thunkMiddleware ]
const mockStore = configureMockStore(middlewares)

describe('Actions: Media actions', () => {
	it('has an action to get the media items and dispatches the FETCH_MEDIA and FETCH_MEDIA_SUCCESS actions if it is successful', () => {
		const items = [{
				comments: { count: 3 },
				createdTime: "1504727453",
				id: "1598092162380084839_40815882",
				likes: {count: 20 }
			},
			{
				comments: { count: 10 },
				createdTime: "1503344575",
				id: "1586491746932640169_40815882",
				likes: {count: 15 }
			}]

		const responseStub = { _bodyText: JSON.stringify(items), status: 200, json: () => JSON.stringify(items) }
		const jsonapiStub = sinon.stub(jsonapi, 'deserialize').returns(items)
		const fetchStub = sinon.stub(global, 'fetch').resolves(responseStub)

		const store = mockStore({ media: {} })

		return store.dispatch(getMedia('345345')).then(() => {
			jsonapiStub.restore()
			fetchStub.restore()

			expect(store.getActions()).to.deep.equal([
				{ type: FETCH_MEDIA },
				{ type: FETCH_MEDIA_SUCCESS, payload: items }
			])
		})
	})

	it('has an action to get the media items and dispatches the FETCH_MEDIA and FETCH_MEDIA_ERROR actions if it is unsuccessful', () => {
		const fetchStub = sinon.stub(global, 'fetch').rejects('some error')

		const store = mockStore({ media: {} })

		return store.dispatch(getMedia('345345')).then(() => {
			fetchStub.restore()

			expect(store.getActions()).to.deep.equal([
				{ type: FETCH_MEDIA },
				{ type: FETCH_MEDIA_ERROR }
			])
		})
	})
})