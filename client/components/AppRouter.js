import React from 'react'
import { Switch, Route } from 'react-router-dom'
import RepoChangedFiles from './RepoChangedFiles'
import GroupedBarGraph from './GroupedBarGraph'
import RepoAdditionsDeletions from '../containers/RepoAdditionsDeletions'
import Homepage from '../pages/Homepage'
import Graphpage from '../pages/GraphPage'

const groupedBarGraphOptions = {
	xAxis: 'label',
	yAxis: 'count'
}

class AppRouter extends React.Component {
	render() {
		return (
			<Switch>
				<Route exact path='/' component={Homepage} />
				<Route path='/graphs/repo-additions-deletions' component={Graphpage(RepoAdditionsDeletions, GroupedBarGraph, groupedBarGraphOptions)} />
				<Route path='/graphs/repo-files' component={Graphpage(RepoAdditionsDeletions, RepoChangedFiles, groupedBarGraphOptions)} />
			</Switch>
		)
	}
}

export default AppRouter