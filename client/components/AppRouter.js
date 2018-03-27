import React from 'react'
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom'
import GroupedBarGraph from './GroupedBarGraph'
import RepoAdditionsDeletions from '../containers/RepoAdditionsDeletions'
import HomePage from '../pages/Homepage'

class AppRouter extends React.Component {
	render() {
		return (
			<Router>
				<Switch>
					<Route exact path='/' component={HomePage} />
					<Route path='/graphs/repo-additions-deletions' component={RepoAdditionsDeletions(GroupedBarGraph, 'label', 'count')} />
        </Switch>
			</Router>
		)
	}
}

export default AppRouter