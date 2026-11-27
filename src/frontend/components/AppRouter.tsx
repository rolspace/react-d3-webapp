import { Route, Routes, useLocation } from 'react-router'
import RepoCommits from '../features/repo/RepoCommits'
import PrivateRoute from '../features/user/PrivateRoute'
import RequireAuth from '../features/user/RequireAuth'
import GraphPage from '../pages/GraphPage'
import Login from '../pages/Login'
import BarGraphAddsDeletes from './BarGraphAddsDeletes'
import BarGraphChangedFiles from './BarGraphChangedFiles'
import CommitsPerWeek from './CommitsPerWeek'
import EcdfCommitSize from './EcdfCommitSize'
import HomePage from '../pages/HomePage'

const AppRouter: React.FC = () => {
  const { pathname, search } = useLocation()

  const AddsDeletes = GraphPage(RepoCommits, BarGraphAddsDeletes)
  const ChangedFiles = GraphPage(RepoCommits, BarGraphChangedFiles)
  const CommitSize = GraphPage(RepoCommits, EcdfCommitSize)
  const CommitsWeekly = GraphPage(RepoCommits, CommitsPerWeek)

  return (
    <Routes>
      <Route
        path="/"
        element={
          <RequireAuth>
            <HomePage />
          </RequireAuth>
        }
      />
      <Route path="/welcome" element={<Login />} />
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
      <Route
        path="/graphs/repo-commit-size"
        element={
          <PrivateRoute
            path="/graphs/repo-commit-size"
            pathname={pathname}
            search={search}
          >
            <CommitSize />
          </PrivateRoute>
        }
      />
      <Route
        path="/graphs/repo-commits-per-week"
        element={
          <PrivateRoute
            path="/graphs/repo-commits-per-week"
            pathname={pathname}
            search={search}
          >
            <CommitsWeekly />
          </PrivateRoute>
        }
      />
    </Routes>
  )
}

export default AppRouter
