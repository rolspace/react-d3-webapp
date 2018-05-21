import React from 'react'
import { Switch, Route } from 'react-router-dom'
import RepoChangedFiles from './RepoChangedFiles'
import GroupedBarGraph from './GroupedBarGraph'
import RepoAdditionsDeletions from '../containers/RepoAdditionsDeletions'
import HomePage from '../pages/HomePage'
import GraphPage from '../pages/GraphPage'

const options = {
	xAxis: 'label',
	yAxis: 'count'
}

const addsDeletesOptions = Object.assign(options, {
	sets: ['linesAdded', 'linesDeleted']
})

const changedFilesOptions = Object.assign(options, {
	sets: ['changedFiles']
})

const AppRouter = () => {
	return (
		<Switch>
			<Route exact path='/' component={HomePage} />
			<Route path='/graphs/repo-additions-deletions' component={GraphPage(RepoAdditionsDeletions, GroupedBarGraph, addsDeletesOptions)} />
			<Route path='/graphs/repo-files' component={GraphPage(RepoAdditionsDeletions, RepoChangedFiles, changedFilesOptions)} />
		</Switch>
	)
}

export default AppRouter