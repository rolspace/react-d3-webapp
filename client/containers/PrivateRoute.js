/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */

import React from 'react';
import { Redirect, Route, withRouter } from 'react-router-dom';
import querystring from '../core/querystring';
import auth from '../core/authenticate';

class PrivateRoute extends React.Component {
	constructor(props) {
		super(props);
		
		this.state = {
			auth: false,
			loading: false
		};
	}

	componentWillMount() {
		if (this.props.location.search) {

			this.setState({ loading: true });
			const qsObject = querystring.parse(this.props.location.search);
			const { code } = qsObject;

			auth.login(code)
			.then(response => {
				this.setState({
					auth: response.auth,
					loading: false
				})

				//dispatch the loginUser action
			})
			.catch(error => {
				this.setState({
					loading: false
				});
			});
		}
	}

	render() {
		if (this.state.loading) {
			return <div>Loading...</div>;
		}
		else if (!this.state.loading && this.state.auth) {
			return <Route render={() => <this.props.component /> } />;
		}
		else {
			return <Route render={() => <Redirect to={{ pathname: '/' }} /> } />;
		}
	}
}

export default withRouter(PrivateRoute);