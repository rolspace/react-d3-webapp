import React from 'react'
import PropTypes from 'prop-types'
import Grid from 'material-ui/Grid'
import TextField from 'material-ui/TextField'
import Button from 'material-ui/Button';

class OwnerRepoForm extends React.Component {
	constructor(props) {
		super(props)
		this.handleSubmit = this.handleSubmit.bind(this)
		this.handleChange = this.handleChange.bind(this)

		this.state = {
			owner: '',
			repo: ''
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

		this.props.onFormSubmit(this.state.owner, this.state.repo)
	}

	render() {
		return (
			<form onSubmit={this.handleSubmit}>
				<Grid container>
					<Grid item xs={4} sm={5}>
						<TextField id='with-placeholder' name='owner' value={this.state.owner}
							label='Owner' margin='normal' fullWidth={true} onChange={this.handleChange} />
					</Grid>
					<Grid item xs={1}></Grid>
					<Grid item xs={4} sm={5}>
						<TextField id='with-placeholder' name='repo' value={this.state.repo}
							label='Repository' margin='normal' fullWidth={true} onChange={this.handleChange} />
					</Grid>
					<Grid item xs={3} sm={1}>
						<Button size='small' variant='raised' type='submit'>GO</Button>
					</Grid>
				</Grid>
			</form>
		)
	}
}

OwnerRepoForm.propTypes = {
	onFormSubmit: PropTypes.func.isRequired
}

export default OwnerRepoForm