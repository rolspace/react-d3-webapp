/* eslint-disable no-console */

import React from 'react';
import { PropTypes } from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { getUser, loginUser } from '../actions/user';
import querystring from '../common/querystring';
import PrivatePage from '../components/PrivatePage';

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
		return <PrivatePage component={this.props.component} login={this.props.login} status={this.props.status} />
	}
}

PrivateRoute.propTypes = {
	component: PropTypes.func,
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