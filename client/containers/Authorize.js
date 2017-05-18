/* eslint-disable no-unused-vars */
/* eslint-disable no-console */

import React, { PropTypes } from 'react';
import { browserHistory } from 'react-router';
import { connect } from 'react-redux';
import { verifyUser } from '../actions/user';

class Authorize extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			user: {
				fetching: false,
				id: '',
				login: false
			}
		};
	}

	componentWillReceiveProps(nextProps) {
		if (nextProps.user && nextProps.user.login) {
			console.log(nextProps.user);
		}	
	}
	
	componentDidMount() {
		const { dispatch } = this.props;
		dispatch(verifyUser());

		console.log(this.props.user);
	}

	render() {
		return (<div></div>);
	}
}

Authorize.propTypes = {
	dispatch: PropTypes.func.isRequired,
	user: PropTypes.object
};

const mapStateToProps = (state) => {
	return {
		user: state.user
	}
};

export default connect(mapStateToProps)(Authorize);