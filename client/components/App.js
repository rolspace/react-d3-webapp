import React from 'react'
import Toolbar from 'material-ui/Toolbar'
import AppBar from 'material-ui/AppBar'
import Grid from 'material-ui/Grid'
import AppRouter from './AppRouter'

class App extends React.Component {
	render() {
		const style = {
			paddingTop: '80px'
		}

		return (
			<div>
				<AppBar>
					<Toolbar>
						React D3 WebApp
					</Toolbar>
				</AppBar>
				<Grid container style={style}>
					<Grid item xs={12}>
							<AppRouter />
					</Grid>
				</Grid>
			</div>
		)
	}
}

export default App