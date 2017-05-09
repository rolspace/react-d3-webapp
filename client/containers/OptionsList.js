/* eslint-disable no-console */
/* eslint-disable no-unused-vars */

import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import Option from '../components/Option';
import { login } from '../actions/login';

class OptionsList extends React.Component {
	componentDidMount() {
		const { dispatch } = this.props;
		dispatch(login(this.props.code));
	}

	render() {
		return (
			<div>The Option Component list should be here</div>
		);
	}
}

OptionsList.propTypes = {
	dispatch: PropTypes.func.isRequired
}

/*function mapStateToProps(state, ownProps) {
	//Retrieve code from query string and
	//request token from Instagram.

	//Create an "authorized" property to add to the state.
	//The token should be stored in the DB
	
	return {
		authorized: state.authorized
	};
}*/

//export default connect(mapStateToProps)(OptionsList);
export default connect()(OptionsList);