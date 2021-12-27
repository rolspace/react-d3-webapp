import { AppBar, Toolbar } from '@material-ui/core'
import { shallow } from 'enzyme'
import React from 'react'
import { BrowserRouter as Router } from 'react-router-dom'
import { App } from '../App'
import AppDrawer from '../AppDrawer'
import AppRouter from '../AppRouter'

describe('Components: App component', () => {
  test('renders correctly', () => {
    const classes = {}

    const component = shallow(<App classes={classes} />)

    expect(component.find(Router).length).toBe(1)
    expect(component.find(AppBar).length).toBe(1)
    expect(component.find(Toolbar).length).toBe(1)
    expect(component.find(AppRouter).length).toBe(1)
    expect(component.find(AppDrawer).length).toBe(1)
  })
})
