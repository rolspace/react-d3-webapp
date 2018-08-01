import React from 'react'
import { Switch, Route } from 'react-router-dom'
import BarGraphAddsDeletes from './BarGraphAddsDeletes'
import BarGraphChangedFiles from './BarGraphChangedFiles'
import RepositoryCommits from '../containers/RepositoryCommits'
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
      <Route path='/graphs/repo-additions-deletions' component={GraphPage(RepositoryCommits, BarGraphAddsDeletes, options)} />
      <Route path='/graphs/repo-files' component={GraphPage(RepositoryCommits, BarGraphChangedFiles, options)} />
		</Switch>
	)
}

export default AppRouter