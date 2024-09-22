import React from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
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
  const { pathname, search } = useLocation()

  const AddsDeletes = GraphPage(RepoCommits, BarGraphAddsDeletes, options)
  const ChangedFiles = GraphPage(RepoCommits, BarGraphChangedFiles, options)

  return (
    <Routes>
      <Route exact path="/" element={<HomePage />} />
      <Route
        exact
        path="/graphs/repo-additions-deletions"
        element={
          <PrivateRoute
            path="/graphs/repo-additions-deletions"
            pathname={pathname}
            search={search}
          >
            <AddsDeletes />
          </PrivateRoute>
        }
      />
      <Route
        exact
        path="/graphs/repo-files"
        element={
          <PrivateRoute
            path="/graphs/repo-files"
            pathname={pathname}
            search={search}
          >
            <ChangedFiles />
          </PrivateRoute>
        }
      />
    </Routes>
  )
}

export default AppRouter
