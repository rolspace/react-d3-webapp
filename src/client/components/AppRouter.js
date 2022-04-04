import React from 'react'
import { Switch, Route } from 'react-router-dom'
import BarGraphAddsDeletes from './BarGraphAddsDeletes'
import BarGraphChangedFiles from './BarGraphChangedFiles'
import RepoCommits from '../containers/RepoCommits'
import HomePage from '../pages/HomePage'
import GraphPage from '../pages/GraphPage'
import PrivateRoute from '../containers/PrivateRoute'

const options = {
  xAxis: 'label',
  yAxis: 'count',
}

const AppRouter = () => {
  return (
    <Switch>
      <Route exact path="/" component={HomePage} />
      <PrivateRoute
        path="/graphs/repo-additions-deletions"
        component={GraphPage(RepoCommits, BarGraphAddsDeletes, options)}
      />
      <PrivateRoute
        path="/graphs/repo-files"
        component={GraphPage(RepoCommits, BarGraphChangedFiles, options)}
      />
    </Switch>
  )
}

export default AppRouter
