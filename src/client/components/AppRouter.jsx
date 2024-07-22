import React from 'react'
import { Route, Routes } from 'react-router-dom'
import RepoCommits from '../features/repo/RepoCommits'
import PrivateRoute from '../features/user/PrivateRoute'
import GraphPage from '../pages/GraphPage'
import HomePage from '../pages/HomePage'
import BarGraphAddsDeletes from './BarGraphAddsDeletes'
import BarGraphChangedFiles from './BarGraphChangedFiles'

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
