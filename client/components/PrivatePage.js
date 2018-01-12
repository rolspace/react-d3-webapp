import React from 'react'
import { PropTypes } from 'prop-types'
import { Redirect, Route } from 'react-router-dom'

class PrivatePage extends React.Component {
	render() {
		if (this.props.user.isComplete) {
			if (this.props.user.isLoggedIn) {
				return <Route render={() => <this.props.component /> } />
			}
			else if (this.props.user.error) {
				return <div>An error has occurred</div>
			}
			else {
				return <Route render={() => <Redirect to={{ pathname: '/' }} /> } />
			}
		}
		else if (this.props.user.isFetching) {
			return <div>Loading...</div>
		}
		else {
			return <div></div>
		}
	}
}

PrivatePage.propTypes = {
	component: PropTypes.func.isRequired,
	user: PropTypes.object
}

export default PrivatePage