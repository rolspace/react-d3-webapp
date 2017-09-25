import React from 'react'
import { PropTypes } from 'prop-types'
import { Redirect, Route } from 'react-router-dom'

class PrivatePage extends React.Component {
	render() {
		if (this.props.status === '' || this.props.status === 'PENDING') {
			return <div>Loading...</div>
		}
		else if (this.props.status === 'ERROR') {
			return <div>An error has occurred</div>
		}
		else if (this.props.status === 'SUCCESS' && this.props.login) {
			return <Route render={() => <this.props.component /> } />
		}
		else {
			return <Route render={() => <Redirect to={{ pathname: '/' }} /> } />
		}
	}
}

PrivatePage.propTypes = {
	component: PropTypes.func.isRequired,
	login: PropTypes.bool.isRequired,
	status: PropTypes.string.isRequired
}

export default PrivatePage