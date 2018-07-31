import React from 'react'
import PropTypes from 'prop-types'
import { hot } from 'react-hot-loader'
import { BrowserRouter as Router, Link } from 'react-router-dom'
import { withStyles } from '@material-ui/core/styles'
import IconButton from '@material-ui/core/IconButton'
import Typography from '@material-ui/core/Typography'
import Toolbar from '@material-ui/core/Toolbar'
import AppBar from '@material-ui/core/AppBar'
import Grid from '@material-ui/core/Grid'
import MenuIcon from '@material-ui/icons/Menu'
import AppRouter from './AppRouter'

const styles = theme => ({
	container: {
		[theme.breakpoints.up('md')]: {
			paddingLeft: '80px',
			paddingRight: '80px'
		}
	},
	bar_anchor: {
		color: 'white',
		textDecoration: 'none'
	},
	bar_anchor_reset: {
		color: 'inherit',
		textDecoration: 'inherit'
	}
})

const App = (props) => {
	const { classes } = props

	return (
		<Router>
			<div>
				<AppBar>
					<Toolbar>
						<IconButton className={classes.menuButton} color="inherit" aria-label="Menu">
							<MenuIcon />
						</IconButton>
						<Typography variant="title" className={classes.bar_anchor}>
							<Link className={classes.bar_anchor_reset} to="/">GH repositories / charts and data</Link>
						</Typography>
					</Toolbar>
				</AppBar>
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
	classes: PropTypes.object.isRequired
}

export default hot(module)(withStyles(styles)(App))