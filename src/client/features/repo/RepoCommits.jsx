import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'
import Grid from '@mui/material/Grid'
import PropTypes from 'prop-types'
import React, { useEffect } from 'react'
import { useRepoStore } from '../../stores/repoStore'
import { useUserStore } from '../../stores/userStore'

const RepoCommits = ({ graphComponent, options }) => {
  const owner = useRepoStore((state) => state.owner)
  const repository = useRepoStore((state) => state.repository)
  const commits = useRepoStore((state) => state.commits)
  const loading = useRepoStore((state) => state.loading)
  const fulfilled = useRepoStore((state) => state.fulfilled)
  const error = useRepoStore((state) => state.error)
  const token = useUserStore((state) => state.token)
  const fetchRepo = useRepoStore((state) => state.fetchRepo)

  useEffect(() => {
    if (
      token !== '' &&
      loading === 'idle' &&
      fulfilled === false &&
      error === null
    ) {
      fetchRepo({ owner, repository, token })
    }
  }, [owner, repository, token, fulfilled, loading, error, fetchRepo])

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

  return <GraphComponent datasource={commits} loading={loading} {...options} />
}

RepoCommits.propTypes = {
  graphComponent: PropTypes.elementType.isRequired,
  options: PropTypes.object.isRequired,
}

export default RepoCommits
