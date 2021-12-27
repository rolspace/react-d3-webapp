import { shallow } from 'enzyme'
import React from 'react'
import { Switch } from 'react-router-dom'
import PrivateRoute from '../../containers/PrivateRoute'
import AppRouter from '../AppRouter'

describe('Components: AppRouter component', () => {
  it('renders correctly', () => {
    const component = shallow(<AppRouter />)

    expect(component.find(Switch).length).toBe(1)
    expect(component.find(PrivateRoute).length).toBe(2)
  })
})
