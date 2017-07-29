import React from 'react'
import { PropTypes } from 'prop-types'
import { Redirect, Route } from 'react-router-dom'

class PrivatePage extends React.Component {
	render() {
		if (this.props.status !== 'COMPLETE') {
			return <div>Loading...</div>
		}
		else if (this.props.status === 'COMPLETE' && this.props.login) {
			return <Route render={() => <this.props.component /> } />
		}
		else {
			return <Route render={() => <Redirect to={{ pathname: '/' }} /> } />
		}
	}
}

PrivatePage.propTypes = {
	component: PropTypes.func,
	login: PropTypes.bool,
	status: PropTypes.string
}

export default PrivatePage