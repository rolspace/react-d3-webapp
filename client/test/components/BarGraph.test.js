import React from 'react'
import { expect } from 'chai'
import { shallow } from 'enzyme'
import BarGraph from '../../components/BarGraph'

describe('Components: BarGraph component', () => {
  it('renders one <svg> element', () => {
    const wrapper = shallow(<BarGraph data={[]} xAxis='' yAxis='' />)
    expect(wrapper.find('svg')).to.have.length(1)
  })
})