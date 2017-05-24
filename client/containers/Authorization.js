/* eslint-disable react/prop-types */

import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { browserHistory } from 'react-router';
import { verifyUser } from '../actions/user';

const Authorization = (WrappedComponent) => {
	return connect(mapStateToProps)(class AuthorizationComponent extends React.Component {
		componentDidMount() {
			if (!this.props.location.query.code) {
				const { dispatch } = this.props;
				dispatch(verifyUser());
			}
		}

		componentWillReceiveProps(nextProps) {
			const stoppedFetching = this.props.user.fetching && !nextProps.user.fetching;
			if (stoppedFetching && !nextProps.user.login) {
				browserHistory.push('/');
			}
		}

		render() {
			if ((this.props.user && this.props.user.login) || this.props.location.query.code) {
				return <WrappedComponent {...this.props} />
			}
			else {
				return null;
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