import { shallow } from 'enzyme'
import React from 'react'
import GraphList from '../../components/GraphList'
import { HomePage } from '../HomePage'

describe('Components: HomePage component', () => {
  it('renders correctly', () => {
    const classes = {}

    const component = shallow(<HomePage classes={classes} />)
    expect(component.find(GraphList).length).toBe(1)
  })
})
