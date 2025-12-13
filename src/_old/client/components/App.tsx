import MenuIcon from '@mui/icons-material/Menu'
import AppBar from '@mui/material/AppBar'
import Grid from '@mui/material/Grid'
import IconButton from '@mui/material/IconButton'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import { styled, Theme } from '@mui/material/styles'
import React, { useState } from 'react'
import { Link, BrowserRouter as Router } from 'react-router-dom'
import AppDrawer from './AppDrawer'
import AppRouter from './AppRouter'

const PREFIX = 'App'

const classes = {
  container: `${PREFIX}-container`,
  bar_anchor: `${PREFIX}-bar_anchor`,
  bar_anchor_reset: `${PREFIX}-bar_anchor_reset`,
  menuButton: `${PREFIX}-menuButton`,
}


const AppRoot = styled('div')<{ theme?: Theme }>(({ theme }) => ({
  [`& .${classes.container}`]: {
    [theme?.breakpoints?.up('md')]: {
      paddingLeft: '80px',
      paddingRight: '80px',
    },
  },
  [`& .${classes.bar_anchor}`]: {
    color: 'white',
    textDecoration: 'none',
  },
  [`& .${classes.bar_anchor_reset}`]: {
    color: 'inherit',
    textDecoration: 'inherit',
  }
}))

const App: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false)

  const handleDrawer = () => {
    setMenuOpen(!menuOpen)
  }

  return (
    <Router>
      <AppRoot>
        <AppBar>
          <Toolbar>
            <IconButton
              onClick={handleDrawer}
              className={classes.menuButton}
              color="inherit"
              aria-label="Menu"
              size="large"
            >
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
          <Grid size={{ xs: 12, sm: 12 }}>
            <AppRouter />
          </Grid>
        </Grid>
      </AppRoot>
    </Router>
  )
}

export default App
