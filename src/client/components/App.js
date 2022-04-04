import AppBar from '@material-ui/core/AppBar'
import Grid from '@material-ui/core/Grid'
import IconButton from '@material-ui/core/IconButton'
import { withStyles } from '@material-ui/core/styles'
import Toolbar from '@material-ui/core/Toolbar'
import Typography from '@material-ui/core/Typography'
import MenuIcon from '@material-ui/icons/Menu'
import PropTypes from 'prop-types'
import React, { useState } from 'react'
import { hot } from 'react-hot-loader'
import { BrowserRouter as Router, Link } from 'react-router-dom'
import AppDrawer from './AppDrawer'
import AppRouter from './AppRouter'

const styles = (theme) => ({
  container: {
    [theme.breakpoints.up('md')]: {
      paddingLeft: '80px',
      paddingRight: '80px',
    },
  },
  bar_anchor: {
    color: 'white',
    textDecoration: 'none',
  },
  bar_anchor_reset: {
    color: 'inherit',
    textDecoration: 'inherit',
  },
})

const App = ({ classes }) => {
  const [menuOpen, setMenuOpen] = useState(false)

  const handleDrawer = () => {
    setMenuOpen(!menuOpen)
  }

  return (
    <Router>
      <div>
        <AppBar>
          <Toolbar>
            <IconButton
              onClick={handleDrawer}
              className={classes.menuButton}
              color="inherit"
              aria-label="Menu">
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" className={classes.bar_anchor}>
              <Link className={classes.bar_anchor_reset} to="/">
                GH repositories / charts and data
              </Link>
            </Typography>
          </Toolbar>
        </AppBar>
        <AppDrawer open={menuOpen} onClose={handleDrawer} />
        <Grid container className={classes.container}>
          <Grid item xs={12} sm={12}>
            <AppRouter />
          </Grid>
        </Grid>
      </div>
    </Router>
  )
}

App.propTypes = {
  classes: PropTypes.object.isRequired,
}

export { App }

export default hot(module)(withStyles(styles)(App))
