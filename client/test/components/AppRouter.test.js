import React from 'react'
import { expect } from 'chai'
import { shallow } from 'enzyme'
import { BrowserRouter as Router } from 'react-router-dom'
import AppRouter from '../../components/AppRouter'

describe('Components: AppRouter component', () => {
  it('renders one <Router> component', () => {
    const wrapper = shallow(<AppRouter />)
    expect(wrapper.find(Router)).to.have.length(1)
  })
})