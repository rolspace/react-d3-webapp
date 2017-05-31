/* eslint-disable react/prop-types */
/* eslint-disable no-console */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import querystring from  '../core/querystring';
import { verifyUser } from '../actions/user';

const Authorization = (WrappedComponent) => {
	return connect(mapStateToProps)(class AuthorizationComponent extends React.Component {
		constructor(props) {
			super(props);
			
			const qs = querystring.parse(this.props.location.search)
			this.state = { code: qs.code };
		}

		componentDidMount() {
			if (!this.state.code) {
				const { dispatch } = this.props;
				dispatch(verifyUser());
			}
		}

		//componentWillReceiveProps(nextProps) {
			//const stoppedFetching = this.props.user.fetching && !nextProps.user.fetching;
			// if (stoppedFetching && !nextProps.user.login) {
			// 	browserHistory.push('/');
			// }
		//}

		render() {
			if ((this.props.user && this.props.user.login) || this.state.code) {
				return <WrappedComponent {...this.props} code={this.state.code} />
			}
			else {
				//Redirect here
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