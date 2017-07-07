import React from 'react'
import { expect } from 'chai'
import { shallow, mount } from 'enzyme'
import createRouterContext from 'react-router-test-context'
import StartPage from '../../pages/start'
import RecentMedia from '../../pages/recent'
import OptionsList from '../../components/OptionsList'

describe('StartPage Component', function() {
	// const mockStore = configureStore()
	// let store

	// beforeEach(() => {
	// 	store = mockStore({});
	// })

	StartPage.contextTypes = {
    router: React.PropTypes.object
  }

	it('should render one <OptionsList> Component', () => {
		const wrapper = shallow(<StartPage/>)
		expect(wrapper.find(OptionsList)).to.have.length(1)
	})

	it('should render one <RecentMedia> Component', () => {
		const context = createRouterContext()

		const wrapper = shallow(<StartPage/>, { context })
		expect(wrapper.find(RecentMedia)).to.have.length(1)
	})
})