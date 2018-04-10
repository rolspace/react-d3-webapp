import React from 'react'
import PropTypes from 'prop-types'
import Grid from 'material-ui/Grid'
import TextField from 'material-ui/TextField'
import Button from 'material-ui/Button';

class OwnerRepoForm extends React.Component {
	constructor(props) {
		super(props)
		this.handleClick = this.handleClick.bind(this)
	}

	handleClick(e) {
		this.props.onFormSubmit(e)
	}

	render() {
		return (
			<form>
				<Grid container>
					<Grid item xs={4} sm={5}>
						<TextField id="with-placeholder" label="Owner" margin="normal" fullWidth={true} />
					</Grid>
					<Grid item xs={1}></Grid>
					<Grid item xs={4} sm={5}>
						<TextField id="with-placeholder" label="Repository" margin="normal" fullWidth={true} />
					</Grid>
					<Grid item xs={3} sm={1}>
						<Button size="small" variant="raised" onClick={this.handleClick}>GO</Button>
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