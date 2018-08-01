import React from 'react'
import { shallow } from 'enzyme'
import { HomePage } from '../../pages/HomePage'
import GraphList from '../../components/GraphList';

describe('Components: HomePage component', function() {
	it('renders correctly', function() {
		const classes = {}
    
		const component = shallow(<HomePage classes={classes} />)
		expect(component.find(GraphList).length).toBe(1)
	})
})