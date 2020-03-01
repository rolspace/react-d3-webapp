import React from 'react'
import { shallow } from 'enzyme'
import CustomCard from '../Card'
import GraphList from '../GraphList'

describe('Components: GraphList component', () => {
  it('renders correctly', () => {
    const component = shallow(<GraphList />)
    expect(component.find(CustomCard).length).toBe(4)
  })
})
