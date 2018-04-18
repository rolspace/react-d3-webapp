import React from 'react'
import PropTypes from 'prop-types'
import { withStyles } from 'material-ui/styles'
import Grid from 'material-ui/Grid'
import TextField from 'material-ui/TextField'
import Button from 'material-ui/Button'

const styles = {
	container: {
		paddingTop: '60px'
	},
	buttonContainer: {
		lineHeight: '72px',
		textAlign: 'center'
	}
}

class OwnerRepoForm extends React.Component {
	constructor(props) {
		super(props)
		this.handleSubmit = this.handleSubmit.bind(this)
		this.handleChange = this.handleChange.bind(this)

		this.state = {
			owner: this.props.owner || 'facebook',
			name: this.props.name || 'react'
		}
	}

	handleChange(event) {
		const name = event.target.name
		const value = event.target.value

		this.setState({
			[name]: value
		})
	}

	handleSubmit(event) {
		event.preventDefault()

		this.props.onFormSubmit(this.state.owner, this.state.name)
	}

	render() {
		const { classes } = this.props

		return (
			<form onSubmit={this.handleSubmit}>
				<Grid container className={classes.container}>
					<Grid item xs={4} sm={5}>
						<TextField id='with-placeholder' name='owner' value={this.state.owner}
							label='Owner' margin='normal' fullWidth={true} onChange={this.handleChange} />
					</Grid>
					<Grid item xs={1}></Grid>
					<Grid item xs={4} sm={5}>
						<TextField id='with-placeholder' name='name' value={this.state.name}
							label='Repository' margin='normal' fullWidth={true} onChange={this.handleChange} />
					</Grid>
					<Grid item xs={3} sm={1} className={classes.buttonContainer}>
						<Button size='small' variant='raised' type='submit'>GO</Button>
					</Grid>
				</Grid>
			</form>
		)
	}
}

OwnerRepoForm.propTypes = {
	classes: PropTypes.object.isRequired,
	onFormSubmit: PropTypes.func.isRequired,
	owner: PropTypes.string.isRequired,
	name: PropTypes.string.isRequired
}

export default withStyles(styles)(OwnerRepoForm)