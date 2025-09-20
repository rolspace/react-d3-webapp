import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'
import Grid from '@mui/material/Grid'
import PropTypes from 'prop-types'
import React, { useEffect } from 'react'

const RepoCommits = ({ graphComponent, options }) => {

  useEffect(() => {
    if (
      token !== '' &&
      loading === 'idle' &&
      fulfilled === false &&
      error === null
    ) {
    }

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
