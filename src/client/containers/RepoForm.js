import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { withStyles } from '@material-ui/core/styles'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import Grid from '@material-ui/core/Grid'
import { changeRepo } from '../actions/repo'

const styles = {
	container: {
		paddingTop: '60px'
	},
	buttonContainer: {
		lineHeight: '72px',
		textAlign: 'center'
	}
}

class RepoForm extends React.Component {
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
		
		const { user } = this.props

		if (user.isLoggedIn) {
			const { dispatch } = this.props
			dispatch(changeRepo(this.state.owner, this.state.name))
		}
	}
  
	render() {
		const { classes } = this.props
    
		return (
			<form onSubmit={this.handleSubmit}>
        <Grid container className={classes.container}>
          <Grid item xs={4} sm={5}>
            <TextField id='with-placeholder' name='owner' value={this.state.owner}
              label='owner' margin='normal' fullWidth={true} onChange={this.handleChange} />
          </Grid>
          <Grid item xs={1}></Grid>
          <Grid item xs={4} sm={5}>
            <TextField id='with-placeholder' name='name' value={this.state.name}
              label='repository' margin='normal' fullWidth={true} onChange={this.handleChange} />
          </Grid>
          <Grid item xs={3} sm={1} className={classes.buttonContainer}>
          < Button size='small' variant='raised' type='submit'>go</Button>
          </Grid>
        </Grid>
			</form>
		)
	}
}

RepoForm.propTypes = {
	classes: PropTypes.object.isRequired,
	dispatch: PropTypes.func.isRequired,
	name: PropTypes.string.isRequired,
	owner: PropTypes.string.isRequired,
	user: PropTypes.object.isRequired
}

const mapStateToProps = (state) => {
	return {
		name: state.repo.name,
		owner: state.repo.owner,
		user: state.user
	}
}

//TODO: look into using mapDispatchToProps instead of rendering in this component
export default connect(mapStateToProps)(withStyles(styles)(RepoForm))