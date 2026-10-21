import AppBar from '@mui/material/AppBar'
import Grid from '@mui/material/Grid'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import { styled, Theme } from '@mui/material/styles'
import { Link, BrowserRouter as Router } from 'react-router'
import AppRouter from './AppRouter'

const PREFIX = 'App'

const classes = {
  container: `${PREFIX}-container`,
  bar_anchor: `${PREFIX}-bar_anchor`,
  bar_anchor_reset: `${PREFIX}-bar_anchor_reset`,
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
  },
}))

const App: React.FC = () => {
  return (
    <Router>
      <AppRoot>
        <AppBar>
          <Toolbar>
            <Typography variant="h6" className={classes.bar_anchor}>
              <Link className={classes.bar_anchor_reset} to="/">
                Git Charts
              </Link>
            </Typography>
          </Toolbar>
        </AppBar>
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
