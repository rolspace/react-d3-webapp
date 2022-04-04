import configureMockStore from 'redux-mock-store'
import thunkMiddleware from 'redux-thunk'
import 'whatwg-fetch'
import { fetchRepo } from '../../actions/repo'
import * as types from '../../actions/repoTypes'

const middlewares = [thunkMiddleware]
const mockStore = configureMockStore(middlewares)

describe('Actions: repo actions', () => {
  test('fetchRepo dispatches a FETCHING_REPO action and a FETCH_REPO_SUCCESS action if it is successful', async () => {
    const data = {
      type: 'commit',
      data: [
        {
          node: {
            additions: 17,
            deletions: 10,
            changedFiles: 3,
            pushedDate: '2018-07-25T21:22:54Z',
            oid: 'abc1ea0cd96c81467c574b134349eafc30f945d0d',
            author: {
              user: {
                login: 'user1',
              },
            },
          },
        },
        {
          node: {
            additions: 34,
            deletions: 0,
            changedFiles: 1,
            pushedDate: '2018-07-25T15:58:55Z',
            oid: '0999a79fedef38a824a837c535bf853013dd4012',
            author: {
              user: {
                login: 'user2',
              },
            },
          },
        },
      ],
    }

    const response = { status: 200, json: () => Promise.resolve(data) }
    global.fetch = jest.fn().mockImplementation(() => Promise.resolve(response))

    const store = mockStore({ repo: {} })

    await store.dispatch(fetchRepo('owner', 'name'))
    expect(store.getActions()).toEqual([
      { type: types.FETCHING_REPO },
      {
        type: types.FETCH_REPO_SUCCESS,
        payload: {
          owner: 'owner',
          name: 'name',
          data: data.data,
        },
      },
    ])
  })

  test('fetchRepo dispatches a FETCHING_REPO action and a FETCH_REPO_ERROR action if there is an error', async () => {
    const error = new Error('some error')

    global.fetch = jest.fn().mockImplementation(() => Promise.reject(error))

    const store = mockStore({ repo: {} })

    await store.dispatch(fetchRepo('owner', 'name'))
    expect(store.getActions()).toEqual([
      { type: types.FETCHING_REPO },
      {
        error: true,
        type: types.FETCH_REPO_ERROR,
        payload: error,
      },
    ])
  })
})
