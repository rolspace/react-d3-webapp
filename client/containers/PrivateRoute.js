/* eslint-disable no-console */

import React from 'react';
import { PropTypes } from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { getUser, authenticateUser } from '../actions/user';
import querystring from '../common/querystring';
import PrivatePage from '../components/PrivatePage';

class PrivateRoute extends React.Component {
	componentDidMount() {
		const { dispatch } = this.props;

		if (this.props.location.search) {
			const params = querystring.parse(this.props.location.search);
			const { code } = params;

			dispatch(authenticateUser(code));
		}
		else {
			dispatch(getUser());
		}
	}

	render() {
		return <PrivatePage component={this.props.component} user={this.props.user} />
	}
}

PrivateRoute.propTypes = {
	component: PropTypes.func.isRequired,
	dispatch: PropTypes.func,
	user: PropTypes.object
}

const mapStateToProps = (state) => {
	return {
		user: state.user
	}
}

export default withRouter(connect(mapStateToProps)(PrivateRoute));