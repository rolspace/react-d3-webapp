import Button from '@material-ui/core/Button'
import Grid from '@material-ui/core/Grid'
import { withStyles } from '@material-ui/core/styles'
import TextField from '@material-ui/core/TextField'
import PropTypes from 'prop-types'
import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { changeRepo } from '../actions/repo'
import { useInput } from '../hooks/useInput'

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
  const { isLoggedIn } = useSelector((state) => state.user)
  const { owner, name } = useSelector((state) => state.repo)

  const { value: valueOwnerInput, bind: bindOwnerInput } = useInput(owner)
  const { value: valueNameInput, bind: bindNameInput } = useInput(name)

  const dispatch = useDispatch()

  const handleSubmit = (event) => {
    event.preventDefault()

    if (isLoggedIn) {
      dispatch(changeRepo(valueOwnerInput, valueNameInput))
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
