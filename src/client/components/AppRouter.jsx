import React from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import RepoCommits from '../features/repo/RepoCommits.jsx'
import PrivateRoute from '../features/user/PrivateRoute.jsx'
import GraphPage from '../pages/GraphPage.jsx'
import HomePage from '../pages/HomePage.jsx'
import BarGraphAddsDeletes from './BarGraphAddsDeletes.jsx'
import BarGraphChangedFiles from './BarGraphChangedFiles.jsx'

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
