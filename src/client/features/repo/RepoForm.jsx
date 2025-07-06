import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import TextField from '@mui/material/TextField'
import { withStyles } from '@mui/styles'
import PropTypes from 'prop-types'
import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { repoChanged } from './repoSlice.js'

const styles = {
  container: {
    paddingTop: '60px',
  },
  buttonContainer: {
    lineHeight: '72px',
    textAlign: 'center',
  },
}

const RepoForm = ({ classes }) => {
  const { owner, repository, error } = useSelector((state) => state.repo)
  const { token } = useSelector((state) => state.user)

  const [ownerValue, setOwnerValue] = useState(owner)
  const [ownerValueChanged, setOwnerValueChanged] = useState(false)

  const [repositoryValue, setRepositoryValue] = useState(repository)
  const [repositoryValueChanged, setRepositoryValueChanged] = useState(false)

  const dispatch = useDispatch()

  const handleSubmit = (event) => {
    event.preventDefault()

    if (token !== '') {
      dispatch(repoChanged({ ownerValue, repositoryValue }))
    }

    setOwnerValueChanged(false)
    setRepositoryValueChanged(false)
  }

  return (
    <form onSubmit={handleSubmit}>
      <Grid container className={classes.container}>
        <Grid size={{ xs: 4, sm: 5 }}>
          <TextField
            id="owner"
            name="owner"
            label="owner"
            margin="normal"
            fullWidth
            value={ownerValue}
            onChange={(event) => {
              const {
                target: { value: newValue },
              } = event

              setOwnerValueChanged(owner !== newValue)
              setOwnerValue(newValue)
            }}
          />
        </Grid>
        <Grid size={1} />
        <Grid size={{ xs: 4, sm: 5 }}>
          <TextField
            id="repository"
            name="repository"
            label="repository"
            margin="normal"
            fullWidth
            value={repositoryValue}
            onChange={(event) => {
              const {
                target: { value: newValue },
              } = event

              setRepositoryValueChanged(repository !== newValue)
              setRepositoryValue(newValue)
            }}
          />
        </Grid>
        <Grid size={{ xs: 3, sm: 1 }} className={classes.buttonContainer}>
          <Button
            size="small"
            variant="contained"
            type="submit"
            disabled={
              error === null && !(ownerValueChanged || repositoryValueChanged)
            }
          >
            go
          </Button>
        </Grid>
      </Grid>
    </form>
  )
}

RepoForm.propTypes = {
  classes: PropTypes.object.isRequired,
}

export default withStyles(styles)(RepoForm)
