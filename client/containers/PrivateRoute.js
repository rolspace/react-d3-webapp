/* eslint-disable no-console */

import React from 'react';
import { PropTypes } from 'prop-types';
import { connect } from 'react-redux';
import { Redirect, Route, withRouter } from 'react-router-dom';
import { getUser, loginUser } from '../actions/user';
import querystring from '../common/querystring';

class PrivateRoute extends React.Component {
	componentWillMount() {
		const { dispatch } = this.props;

		if (this.props.location.search) {
			const qsObject = querystring.parse(this.props.location.search);
			const { code } = qsObject;

			dispatch(loginUser(code));
		}
		else {
			dispatch(getUser());
		}
	}

	render() {
		if (this.props.status !== 'COMPLETE') {
			return <div>Loading...</div>;
		}
		else if (this.props.status === 'COMPLETE' && this.props.login) {
			return <Route render={() => <this.props.component /> } />;
		}
		else {
			return <Route render={() => <Redirect to={{ pathname: '/' }} /> } />;
		}
	}
}

PrivateRoute.propTypes = {
	dispatch: PropTypes.func.isRequired,
	login: PropTypes.bool,
	status: PropTypes.string
}

const mapStateToProps = (state) => {
	return {
		login: state.user.login,
		status: state.user.status
	}
}

export default withRouter(connect(mapStateToProps)(PrivateRoute));