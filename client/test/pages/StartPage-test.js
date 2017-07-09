import React from 'react'
import { expect } from 'chai'
import { shallow } from 'enzyme'
import StartPage from '../../pages/start'
import OptionsList from '../../components/OptionsList'

describe('StartPage Component', function() {
	it('should render one <OptionsList> Component', () => {
		const wrapper = shallow(<StartPage/>)
		expect(wrapper.find(OptionsList)).to.have.length(1)
	})
})