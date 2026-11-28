import { Route, Routes } from 'react-router'
import RepoCommits from '../features/repo/RepoCommits'
import RequireAuth from '../features/user/RequireAuth'
import GraphPage from '../pages/GraphPage'
import Login from '../pages/Login'
import BarGraphAddsDeletes from './BarGraphAddsDeletes'
import BarGraphChangedFiles from './BarGraphChangedFiles'
import CommitSummaryStats from './CommitSummaryStats'
import CommitsPerWeek from './CommitsPerWeek'
import EcdfCommitSize from './EcdfCommitSize'
import HomePage from '../pages/HomePage'

const AppRouter: React.FC = () => {
  const AddsDeletes = GraphPage(RepoCommits, BarGraphAddsDeletes)
  const ChangedFiles = GraphPage(RepoCommits, BarGraphChangedFiles)
  const CommitSize = GraphPage(RepoCommits, EcdfCommitSize)
  const CommitsWeekly = GraphPage(RepoCommits, CommitsPerWeek)
  const CommitSummary = GraphPage(RepoCommits, CommitSummaryStats)

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
          <RequireAuth>
            <AddsDeletes />
          </RequireAuth>
        }
      />
      <Route
        path="/graphs/repo-files"
        element={
          <RequireAuth>
            <ChangedFiles />
          </RequireAuth>
        }
      />
      <Route
        path="/graphs/repo-commit-size"
        element={
          <RequireAuth>
            <CommitSize />
          </RequireAuth>
        }
      />
      <Route
        path="/graphs/repo-commits-per-week"
        element={
          <RequireAuth>
            <CommitsWeekly />
          </RequireAuth>
        }
      />
      <Route
        path="/graphs/repo-summary"
        element={
          <RequireAuth>
            <CommitSummary />
          </RequireAuth>
        }
      />
    </Routes>
  )
}

export default AppRouter
