import React from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import RepoCommits from '../features/repo/RepoCommits'
import PrivateRoute from '../features/user/PrivateRoute'
import GraphPage from '../pages/GraphPage'
import HomePage from '../pages/HomePage'
import BarGraphAddsDeletes from './BarGraphAddsDeletes'
import BarGraphChangedFiles from './BarGraphChangedFiles'

const AppRouter: React.FC = () => {
  const { pathname, search } = useLocation()

  const AddsDeletes = GraphPage(RepoCommits, BarGraphAddsDeletes)
  const ChangedFiles = GraphPage(RepoCommits, BarGraphChangedFiles)

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route
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
