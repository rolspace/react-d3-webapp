/* eslint-disable react/prop-types */

import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { verifyUser } from '../actions/user';

const Authorization = (WrappedComponent) => {
	return connect(mapStateToProps)(class AuthorizationComponent extends React.Component {
		componentWillMount() {
			const { dispatch } = this.props;
			dispatch(verifyUser());
		}

		render() {
			if (this.props.location.query.code || (this.props.user && this.props.user.login)) {
				return <WrappedComponent {...this.props} />
			}
			else {
				return <div>This will not work</div>
			}
		}
	})
}

Authorization.propTypes = {
	dispatch: PropTypes.func.isRequired,
	user: PropTypes.object
}

const mapStateToProps = (state) => {
	return {
		user: state.user
	}
}

export default Authorization;