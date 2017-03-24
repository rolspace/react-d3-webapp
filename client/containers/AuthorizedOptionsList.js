/* eslint-disable no-console */
/* eslint-disable no-unused-vars */

import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import Options from '../components/Options';
import { requestAuthorization } from '../actions/request-authorization';

class AuthorizedOptionsList extends React.Component {
	componentDidMount() {
		const { dispatch } = this.props;
		dispatch(requestAuthorization(this.props.code));

		//console.log(this.props.code);
	}

	render() {
		return (
			<div>The Option Component list should be here</div>
		);
	}
}

AuthorizedOptionsList.propTypes = {
	dispatch: PropTypes.func.isRequired
}

function mapStateToProps(state, ownProps) {
	//Retrieve code from query string and
	//request token from Instagram.

	//Create an "authorized" property to add to the state.
	//The token should be stored in the DB
	
	return {
		authorized: state.authorized
	};
}

export default connect(mapStateToProps)(AuthorizedOptionsList);