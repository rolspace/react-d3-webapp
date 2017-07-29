import React from 'react'
import { PropTypes } from 'prop-types'
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom'
import HomePage from '../pages/home'
import StartPage from '../pages/start'
import PrivateRoute from '../containers/PrivateRoute'

class AppRouter extends React.Component {
	render() {
		return (
			<Router>
				<Switch>
					<Route exact path='/' component={HomePage} />
					<PrivateRoute path='/start' component={StartPage} />
          </Switch>
			</Router>
		)
	}
}

AppRouter.propTypes = {
	component: PropTypes.func,
	path: PropTypes.string
}

export default AppRouter