import React from 'react'
import PropTypes from 'prop-types'
import { withStyles } from 'material-ui/styles'
import Typography from 'material-ui/Typography'
import Toolbar from 'material-ui/Toolbar'
import AppBar from 'material-ui/AppBar'
import Grid from 'material-ui/Grid'
import AppRouter from './AppRouter'

const styles = {
	container: {
		paddingTop: '80px'
	}
}

const App = (props) => {
	const { classes } = props

	return (
		<div>
			<AppBar>
				<Toolbar>
					<Typography variant="title" color="inherit">React D3 WebApp</Typography>
				</Toolbar>
			</AppBar>
			<Grid container className={classes.container} justify='center'>
				<Grid item xs={12} sm={6}>
					<AppRouter />
				</Grid>
			</Grid>
		</div>
	)
}

App.propTypes = {
	classes: PropTypes.object.isRequired
}

export default withStyles(styles)(App)