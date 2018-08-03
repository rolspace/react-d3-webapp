import React from 'react'
import { shallow } from 'enzyme'
import { Switch, Route } from 'react-router-dom'
import AppRouter from '../../components/AppRouter'

describe('Components: AppRouter component', () => {
  it('renders correctly', () => {
    const component = shallow(<AppRouter />)
    
    expect(component.find(Switch).length).toBe(1)
    expect(component.find(Route).length).toBe(3)
  })
})