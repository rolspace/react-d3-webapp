import React from 'react'
import { expect } from 'chai'
import { shallow } from 'enzyme'
import StartPage from '../../pages/start'
import RecentMedia from '../../containers/RecentMedia'
import GraphList from '../../components/GraphList'
import BarGraph from '../../components/BarGraph'

describe('StartPage Component', function() {
	it('renders one <GraphList> Component', () => {
		const wrapper = shallow(<StartPage/>)
		expect(wrapper.find(GraphList)).to.have.length(1)
	})
})