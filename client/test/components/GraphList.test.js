import React from 'react'
import { expect } from 'chai'
import { shallow } from 'enzyme'
import { Link } from 'react-router-dom'
import GraphList from '../../components/GraphList'

describe('Components: GraphList component', () => {
  it('renders one <div> element', () => {
    const wrapper = shallow(<GraphList />)
    expect(wrapper.find('div')).to.have.length(1)
  })

  it('renders two <Link> Components', () => {
    const wrapper = shallow(<GraphList />)
    expect(wrapper.find('Link')).to.have.length(2)
  })
})