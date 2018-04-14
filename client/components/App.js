import React from 'react'
import Typography from 'material-ui/Typography'
import Toolbar from 'material-ui/Toolbar'
import AppBar from 'material-ui/AppBar'
import Grid from 'material-ui/Grid'
import AppRouter from './AppRouter'


const App = () => {
	return (
		<div>
			<AppBar>
				<Toolbar>
					<Typography variant="title" color="inherit">React D3 WebApp</Typography>
				</Toolbar>
			</AppBar>
			<Grid container>
				<Grid item xs={12} sm={12}>
					<AppRouter />
				</Grid>
			</Grid>
		</div>
	)
}

export default App