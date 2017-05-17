import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { verifyUser } from '../actions/user';

class App extends React.Component {
	componentDidMount() {
		if (!this.props.login) {
			const { dispatch } = this.props;
			dispatch(verifyUser());
		}
	}

	render() {
		return (
			<div className="app">
				Welcome to TunnelStats
				{this.props.children}
			</div>
		);
	}
}

App.propTypes = {
	children: React.PropTypes.node.isRequired,
	dispatch: PropTypes.func.isRequired,
	login: PropTypes.bool
};

function mapStateToProps(state) {
	return {
		login: state.user.login
	}
}

export default connect(mapStateToProps)(App);