/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */

import React from 'react';
import { Redirect, Route, withRouter } from 'react-router-dom';
import querystring from '../core/querystring';
import Auth from '../core/authenticate';

const PrivateRoute = withRouter(({ component: Component, location }) => {
	if (location.search)
	{
		const qs = querystring.parse(location.search);
		const { code } = qs;

		const auth = new Auth();
		const isAuthenticated = auth.login(code);

		//dispatch action to store user and to create session cookie

		return (<Route render={() => (
			isAuthenticated ? (<Component />) : (<Redirect to={{ pathname: '/' }} />)
		)} />);
	}
	else {
		return (<Route render={() => <Redirect to={{ pathname: '/' }} /> } />)
	}
})

export default withRouter(PrivateRoute);