import Grid from '@material-ui/core/Grid'
import { withStyles } from '@material-ui/core/styles'
import PropTypes from 'prop-types'
import React from 'react'
import GraphList from '../components/GraphList'

const styles = {
  container: {
    paddingTop: '80px',
  },
}

const HomePage = ({ classes }) => {
  return (
    <Grid container className={classes.container} justify="center">
      <Grid item xs={12} sm={6}>
        <GraphList />
      </Grid>
    </Grid>
  )
}

HomePage.propTypes = {
  classes: PropTypes.object.isRequired,
}

export { HomePage }

export default withStyles(styles)(HomePage)
