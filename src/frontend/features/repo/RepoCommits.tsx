import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'
import Grid from '@mui/material/Grid'
import React, { useEffect, ComponentType } from 'react'
import { useRepoStore } from '../../stores/repoStore'
import { RepoGraphProps } from '../../types/graph.types'
import { Status } from '../../types/state.types'

interface RepoCommitsProps {
  graphComponent: ComponentType<RepoGraphProps>
}

const RepoCommits: React.FC<RepoCommitsProps> = ({ graphComponent }) => {
  const owner = useRepoStore((state) => state.owner)
  const repository = useRepoStore((state) => state.repository)
  const commits = useRepoStore((state) => state.commits)
  const hasNextPage = useRepoStore((state) => state.hasNextPage)
  const status = useRepoStore((state) => state.status)
  const error = useRepoStore((state) => state.error)
  const fetchRepo = useRepoStore((state) => state.fetchRepo)

  useEffect(() => {
    if (status === Status.Idle && error === null) {
      // The store records the failure in `error`, so the rethrown error needs no handling here.
      fetchRepo({ owner, repository }).catch(() => undefined)
    }
  }, [owner, repository, status, error, fetchRepo])

  const GraphComponent = graphComponent

  if (error) {
    return (
      <Grid container>
        <Grid size={12}>
          <Grid container sx={{ justifyContent: 'center' }}>
            <Grid size={{ sm: 10, md: 6 }}>
              <Alert severity="error">
                <AlertTitle>Error</AlertTitle>
                An error ocurred while loading the repository data.
                <br />
                Please try again.
              </Alert>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    )
  }

  return <GraphComponent commits={commits} hasNextPage={hasNextPage} status={status} />
}

export default RepoCommits
