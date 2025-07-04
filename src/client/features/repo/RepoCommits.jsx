import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'
import Grid from '@mui/material/Grid'
import PropTypes from 'prop-types'
import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchRepo } from './repoSlice'

const RepoCommits = ({ graphComponent, options }) => {
  const dispatch = useDispatch()

  const { owner, repository, commits, loading, fulfilled, error } = useSelector(
    (state) => state.repo,
  )
  const { token } = useSelector((state) => state.user)

  useEffect(() => {
    if (
      token !== '' &&
      loading === 'idle' &&
      fulfilled === false &&
      error === null
    ) {
      dispatch(fetchRepo({ owner, repository, token }))
    }
  }, [dispatch, owner, repository, token, fulfilled])

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
