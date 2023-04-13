import Button from '@material-ui/core/Button'
import Grid from '@material-ui/core/Grid'
import TextField from '@material-ui/core/TextField'
import { withStyles } from '@material-ui/core/styles'
import PropTypes from 'prop-types'
import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useInput } from '../../lib/hooks/useInput'
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
  const { owner, name } = useSelector((state) => state.repo)
  const { token } = useSelector((state) => state.user)

  const { value: valueOwnerInput, bind: bindOwnerInput } = useInput(owner)
  const { value: valueNameInput, bind: bindNameInput } = useInput(name)

  const dispatch = useDispatch()

  const handleSubmit = (event) => {
    event.preventDefault()

    if (token !== '') {
      dispatch(repoChanged({ valueOwnerInput, valueNameInput }))
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Grid container className={classes.container}>
        <Grid item xs={4} sm={5}>
          <TextField
            id="with-placeholder"
            name="owner"
            label="owner"
            margin="normal"
            fullWidth={true}
            {...bindOwnerInput}
          />
        </Grid>
        <Grid item xs={1}></Grid>
        <Grid item xs={4} sm={5}>
          <TextField
            id="with-placeholder"
            name="name"
            label="repository"
            margin="normal"
            fullWidth={true}
            {...bindNameInput}
          />
        </Grid>
        <Grid item xs={3} sm={1} className={classes.buttonContainer}>
          <Button size="small" variant="contained" type="submit">
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
