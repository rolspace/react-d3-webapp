import React from 'react'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'
import GraphList from '../components/GraphList'

const styles = {
	container: {
		paddingTop: '80px'
	}
}

const HomePage = (props) => {
	const { classes } = props

	return (
		<Grid container className={classes.container} justify='center'>
			<Grid item xs={12} sm={6}>
				<GraphList />
			</Grid>
		</Grid>
	)
}

HomePage.propTypes = {
	classes: PropTypes.object.isRequired
}

export default withStyles(styles)(HomePage)