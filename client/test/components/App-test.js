import React from 'react'
import { Provider } from 'react-redux'
import { expect } from 'chai'
import { shallow } from 'enzyme'
import App from '../../components/App'
import PrivateRoute from '../../containers/PrivateRoute'

describe('App Component', function() {
	it('should render one <Provider/> component', () => {
		const wrapper = shallow(<App/>)
		expect(wrapper.find(Provider)).to.have.length(1)
	})

	it('should render one <PrivateRoute/> component', () => {
		const wrapper = shallow(<App/>)
		expect(wrapper.find(PrivateRoute)).to.have.length(1)
	})
})