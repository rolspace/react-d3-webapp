/* eslint-disable no-console */

import { expect } from 'chai'
import { shallow } from 'enzyme'
import { fetchUser, fetchUserSuccess, fetchUserFailure } from '../../actions/user'
import { USER_FETCH, USER_FETCH_FAILURE, USER_FETCH_SUCCESS } from '../../actions/user'

describe('User Actions', () => {
	it('should create an action to fetch the user', () => {
		const text = 'Fetch user'
		const expectedAction = {
			type: USER_FETCH,
			payload: text
		}

		expect(fetchUser(text)).to.deep.equal(expectedAction)
	})
})