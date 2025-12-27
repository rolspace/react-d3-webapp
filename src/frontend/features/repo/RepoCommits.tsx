import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'
import Grid from '@mui/material/Grid'
import React, { useEffect, ComponentType } from 'react'
import { useRepoStore } from '../../stores/repoStore'
import { useUserStore } from '../../stores/userStore'
import { Status } from '../../types/state.types'

interface RepoCommitsProps {
  graphComponent: ComponentType<any>
}

const RepoCommits: React.FC<RepoCommitsProps> = ({ graphComponent }) => {
  const owner = useRepoStore((state) => state.owner)
  const repository = useRepoStore((state) => state.repository)
  const commitData = useRepoStore((state) => state.commitData)
  const status = useRepoStore((state) => state.status)
  const error = useRepoStore((state) => state.error)
  const token = useUserStore((state) => state.token)
  const fetchRepo = useRepoStore((state) => state.fetchRepo)

  useEffect(() => {
    if (
      token !== '' &&
      status === Status.Idle &&
      error === null
    ) {
      fetchRepo({ owner, repository, token })
    }
  }, [owner, repository, token, status, error, fetchRepo])

  const GraphComponent = graphComponent

  if (error) {
    return (
      <Grid container>
        <Grid size={12}>
          <Grid container justifyContent="center">
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

  return <GraphComponent datasource={commitData} status={status} />
}

export default RepoCommits
