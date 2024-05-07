import Button from '@material-ui/core/Button'
import Grid from '@material-ui/core/Grid'
import TextField from '@material-ui/core/TextField'
import { withStyles } from '@material-ui/core/styles'
import PropTypes from 'prop-types'
import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { repoChanged } from './repoSlice'

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
        <Grid item xs={4} sm={5}>
          <TextField
            id="owner"
            name="owner"
            label="owner"
            margin="normal"
            fullWidth={true}
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
        <Grid item xs={1}></Grid>
        <Grid item xs={4} sm={5}>
          <TextField
            id="repository"
            name="repository"
            label="repository"
            margin="normal"
            fullWidth={true}
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
        <Grid item xs={3} sm={1} className={classes.buttonContainer}>
          <Button
            size="small"
            variant="contained"
            type="submit"
            disabled={
              error === null && !(ownerValueChanged || repositoryValueChanged)
            }>
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
