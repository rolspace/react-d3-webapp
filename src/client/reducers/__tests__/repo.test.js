import repoReducer from '../repo'

describe('Reducers: repo reducer', () => {
  test('returns the initial state if no action is executed', () => {
    expect(repoReducer(undefined, {})).toEqual({
      commits: {
        changedFiles: [],
        linesAdded: [],
        linesDeleted: [],
      },
      owner: 'facebook',
      name: 'react',
      isComplete: false,
      isFetching: false,
      error: null,
    })
  })

  test('returns the correct object when the FETCH_REPO_SUCCESS action is executed', () => {
    const payload = {
      owner: 'owner',
      name: 'name',
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

    expect(
      repoReducer(undefined, { type: 'FETCH_REPO_SUCCESS', payload }),
    ).toEqual({
      commits: {
        changedFiles: [
          { min: 1, max: 1, count: 1, label: '1' },
          { min: 2, max: 2, count: 0, label: '2' },
          { min: 3, max: 3, count: 1, label: '3' },
          { min: 4, max: 4, count: 0, label: '4' },
          { min: 5, max: 5, count: 0, label: '5' },
          { min: 6, max: 10, count: 0, label: '6-10' },
          { min: 11, max: 20, count: 0, label: '11-20' },
          { min: 21, max: 30, count: 0, label: '21-30' },
          { min: 30, max: 10000, count: 0, label: '30+' },
        ],
        linesAdded: [
          { min: 1, max: 20, count: 1, label: '1-20' },
          { min: 21, max: 40, count: 1, label: '21-40' },
          { min: 41, max: 60, count: 0, label: '41-60' },
          { min: 61, max: 80, count: 0, label: '61-80' },
          { min: 81, max: 100, count: 0, label: '81-100' },
          { min: 101, max: 500, count: 0, label: '101-500' },
          { min: 501, max: 1000, count: 0, label: '501-1000' },
          { min: 1001, max: 1500, count: 0, label: '1001-1500' },
          { min: 1500, max: 10000, count: 0, label: '1500+' },
        ],
        linesDeleted: [
          { min: 1, max: 20, count: 1, label: '1-20' },
          { min: 21, max: 40, count: 0, label: '21-40' },
          { min: 41, max: 60, count: 0, label: '41-60' },
          { min: 61, max: 80, count: 0, label: '61-80' },
          { min: 81, max: 100, count: 0, label: '81-100' },
          { min: 101, max: 500, count: 0, label: '101-500' },
          { min: 501, max: 1000, count: 0, label: '501-1000' },
          { min: 1001, max: 1500, count: 0, label: '1001-1500' },
          { min: 1500, max: 10000, count: 0, label: '1500+' },
        ],
      },
      owner: 'owner',
      name: 'name',
      isComplete: true,
      isFetching: false,
      error: null,
    })
  })

  test('returns the correct object when the FETCHING_REPO action is executed', () => {
    expect(repoReducer(undefined, { type: 'FETCHING_REPO' })).toEqual({
      commits: {
        changedFiles: [],
        linesAdded: [],
        linesDeleted: [],
      },
      owner: 'facebook',
      name: 'react',
      isComplete: false,
      isFetching: true,
      error: null,
    })
  })

  test('returns the correct object when the FETCH_REPO_ERROR action is executed', () => {
    const error = new Error('some error')

    const action = {
      payload: error,
      type: 'FETCH_REPO_ERROR',
    }

    expect(repoReducer(undefined, action)).toEqual({
      commits: {
        changedFiles: [],
        linesAdded: [],
        linesDeleted: [],
      },
      owner: 'facebook',
      name: 'react',
      isComplete: true,
      isFetching: false,
      error,
    })
  })
})
