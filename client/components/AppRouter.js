import React from 'react'
import { Switch, Route } from 'react-router-dom'
import RepoChangedFiles from './RepoChangedFiles'
import BarGraphAddsDeletes from './BarGraphAddsDeletes'
import RepoAdditionsDeletions from '../containers/RepoAdditionsDeletions'
import HomePage from '../pages/HomePage'
import GraphPage from '../pages/GraphPage'

const options = {
	xAxis: 'label',
	yAxis: 'count'
}

const AppRouter = () => {
	return (
		<Switch>
			<Route exact path='/' component={HomePage} />
			<Route path='/graphs/repo-additions-deletions' component={GraphPage(RepoAdditionsDeletions, BarGraphAddsDeletes, options)} />
			<Route path='/graphs/repo-files' component={GraphPage(RepoAdditionsDeletions, RepoChangedFiles, options)} />
		</Switch>
	)
}

export default AppRouter