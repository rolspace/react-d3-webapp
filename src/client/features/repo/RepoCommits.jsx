/* eslint-disable react/prop-types */
import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import PropTypes from 'prop-types'
import { fetchRepo } from './repoSlice'
import Alert from '@material-ui/lab/Alert'
import AlertTitle from '@material-ui/lab/AlertTitle'
import Grid from '@material-ui/core/Grid'

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
        <Grid item xs={12}>
          <Grid container justifyContent="center">
            <Grid item sm={10} md={6}>
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
