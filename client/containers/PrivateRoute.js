/* eslint-disable no-console */

import React from 'react';
import { PropTypes } from 'prop-types';
import { connect } from 'react-redux';
import { Redirect, Route, withRouter } from 'react-router-dom';
import { getUser, loginUser } from '../actions/user'; 
import querystring from '../core/querystring';
import auth from '../core/authenticate';

class PrivateRoute extends React.Component {
	constructor(props) {
		super(props);
		
		this.state = {
			auth: false,
			loading: true
		};
	}

	componentWillReceiveProps(nextProps) {
		if (this.state.loading && !nextProps.loading) {
			this.setState({ auth: nextProps.auth, loading: nextProps.loading });
		}
	}

	componentWillMount() {
		const { dispatch } = this.props;

		if (this.props.location.search) {
			const qsObject = querystring.parse(this.props.location.search);
			const { code } = qsObject;

			auth.login(code)
			.then(response => {
				dispatch(loginUser(response));
			})
			.catch(error => {
				console.log(error);

				this.setState({
					loading: false
				});
			});
		}
		else {
			dispatch(getUser());
		}
	}

	render() {
		if (this.props.loading) {
			return <div>Loading...</div>;
		}
		else if (!this.props.loading && this.props.auth) {
			return <Route render={() => <this.props.component /> } />;
		}
		else {
			return <Route render={() => <Redirect to={{ pathname: '/' }} /> } />;
		}
	}
}

PrivateRoute.propTypes = {
	auth: PropTypes.bool,
	dispatch: PropTypes.func.isRequired,
	loading: PropTypes.bool
}

const mapStateToProps = (state) => {
	return {
		auth: state.user.auth,
		loading: state.user.loading
	}
}

export default withRouter(connect(mapStateToProps)(PrivateRoute));