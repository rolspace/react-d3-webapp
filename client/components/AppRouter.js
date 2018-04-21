import React from 'react'
import { Switch, Route } from 'react-router-dom'
import GroupedBarGraph from './GroupedBarGraph'
import RepoAdditionsDeletions from '../containers/RepoAdditionsDeletions'
import HomePage from '../pages/Homepage'
import GraphPage from '../pages/GraphPage'

const groupedBarGraphOptions = {
	xAxis: 'label',
	yAxis: 'count'
}

class AppRouter extends React.Component {
	render() {
		return (
			<Switch>
				<Route exact path='/' component={HomePage} />
				<Route path='/graphs/repo-additions-deletions' component={GraphPage(RepoAdditionsDeletions, GroupedBarGraph, groupedBarGraphOptions)} />
      </Switch>
		)
	}
}

export default AppRouter