import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Link from '@mui/material/Link'
import Paper from '@mui/material/Paper'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Typography from '@mui/material/Typography'
import * as d3 from 'd3'
import React, { useMemo } from 'react'
import { useRepoStore } from '../stores/repoStore'
import { RepoGraphProps } from '../types/graph.types'
import { Status } from '../types/state.types'
import {
  buildCommitUrl,
  computeCommitSummary,
  SIZE_METRICS,
  SizeMetric,
} from '../utils/summaryStats'
import ChartEmptyState from './ChartEmptyState'

const formatCount = d3.format(',')
const formatStatNumber = d3.format(',.1~f')
const PLACEHOLDER = '—'
const formatStat = (v: number | null) => (v === null ? PLACEHOLDER : formatStatNumber(v))
const formatSigned = (v: number) => (v > 0 ? `+${formatCount(v)}` : formatCount(v))

const METRIC_LABELS: Record<SizeMetric, string> = {
  additions: 'Additions',
  deletions: 'Deletions',
  changedFiles: 'Changed files',
}

const StatTile: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <Paper variant="outlined" sx={{ p: 2 }}>
    <Typography variant="body2" color="text.secondary">{label}</Typography>
    <Typography variant="h5" component="p">{value}</Typography>
  </Paper>
)

const CommitSummaryStats: React.FC<RepoGraphProps> = ({ commits, hasNextPage, status }) => {
  const owner = useRepoStore((state) => state.owner)
  const repository = useRepoStore((state) => state.repository)
  const summary = useMemo(() => computeCommitSummary(commits), [commits])

  if (status === Status.Pending) {
    return <CircularProgress sx={{ display: 'block', mx: 'auto', my: 8 }} />
  }
  if (commits.length === 0) {
    return <ChartEmptyState />
  }

  const { totals, quantiles, largest } = summary

  return (
    <Box>
      <Typography variant="body2" sx={{ mb: 1 }}>
        Totals cover the latest {formatCount(totals.commitCount)} {totals.commitCount === 1 ? 'commit' : 'commits'}.
      </Typography>
      {hasNextPage && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Older commits are not included.
        </Typography>
      )}

      <Typography variant="h6" component="h2" sx={{ mt: 2, mb: 1 }}>Totals</Typography>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
          gap: 2,
        }}
      >
        <StatTile label="Commits" value={formatCount(totals.commitCount)} />
        <StatTile label="Additions" value={formatCount(totals.additions)} />
        <StatTile label="Deletions" value={formatCount(totals.deletions)} />
        <StatTile label="Net lines" value={formatSigned(totals.netLines)} />
      </Box>

      <Typography variant="h6" component="h2" sx={{ mt: 3, mb: 1 }}>Commit size</Typography>
      <Table size="small" aria-label="Median and 90th percentile commit size">
        <TableHead>
          <TableRow>
            <TableCell>Metric</TableCell>
            <TableCell align="right">Median</TableCell>
            <TableCell align="right">90th percentile</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {SIZE_METRICS.map((key) => {
            return (
              <TableRow key={key}>
                <TableCell component="th" scope="row">{METRIC_LABELS[key]}</TableCell>
                <TableCell align="right">{formatStat(quantiles[key].median)}</TableCell>
                <TableCell align="right">{formatStat(quantiles[key].p90)}</TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>

      <Typography variant="h6" component="h2" sx={{ mt: 3, mb: 1 }}>Largest commits</Typography>
      <TableContainer sx={{ overflowX: 'auto' }}>
        <Table size="small" aria-label="Largest commits by lines changed">
          <TableHead>
            <TableRow>
              <TableCell>Commit</TableCell>
              <TableCell>Author</TableCell>
              <TableCell align="right">Additions</TableCell>
              <TableCell align="right">Deletions</TableCell>
              <TableCell align="right">Changed files</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {largest.map((commit, index) => {
              const href = buildCommitUrl(owner, repository, commit.oid)
              return (
                <TableRow key={`${commit.oid}-${index}`}>
                  <TableCell component="th" scope="row">
                    {href ? (
                      <Link
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Commit ${commit.shortOid} on GitHub (opens in a new tab)`}
                        sx={{ fontFamily: 'monospace' }}
                      >
                        {commit.shortOid}
                      </Link>
                    ) : (
                      <Box component="span" sx={{ fontFamily: 'monospace' }}>{commit.shortOid}</Box>
                    )}
                  </TableCell>
                  <TableCell>{commit.author}</TableCell>
                  <TableCell align="right">{formatStat(commit.additions)}</TableCell>
                  <TableCell align="right">{formatStat(commit.deletions)}</TableCell>
                  <TableCell align="right">{formatStat(commit.changedFiles)}</TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  )
}

export default CommitSummaryStats
