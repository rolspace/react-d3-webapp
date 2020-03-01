import React from 'react'
import { shallow } from 'enzyme'
import { BrowserRouter as Router } from 'react-router-dom'
import { AppBar, Toolbar } from '@material-ui/core'
import { App as App } from '../App'
import AppRouter from '../AppRouter'
import AppDrawer from '../AppDrawer'

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
