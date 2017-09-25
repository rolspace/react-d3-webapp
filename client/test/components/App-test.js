import React from 'react'
import { expect } from 'chai'
import { shallow } from 'enzyme'
import App from '../../components/App'
import AppRouter from '../../components/AppRouter'
import AppBar from 'material-ui/AppBar'

describe('Components: App component', () => {
	it('renders one <AppBar> component', () => {
		const wrapper = shallow(<App />)
		expect(wrapper.find(AppBar)).to.have.length(1)
	})

	it('renders one <AppRouter> component', () => {
		const wrapper = shallow(<App />)
		expect(wrapper.find(AppRouter)).to.have.length(1)
	})
})