import React from 'react'
import PropTypes from 'prop-types'
import { BrowserRouter as Router, Link } from 'react-router-dom'
import { withStyles } from 'material-ui/styles'
import Typography from 'material-ui/Typography'
import Toolbar from 'material-ui/Toolbar'
import AppBar from 'material-ui/AppBar'
import Grid from 'material-ui/Grid'
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
						<Typography variant="title" className={classes.bar_anchor}>
							<Link className={classes.bar_anchor_reset} to="/">React D3 WebApp</Link>
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

export default withStyles(styles)(App)