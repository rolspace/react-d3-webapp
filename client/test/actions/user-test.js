/* eslint-disable no-console */

import { expect } from 'chai'
import { fetchUser } from '../../actions/user'
import { USER_FETCH } from '../../actions/user'

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