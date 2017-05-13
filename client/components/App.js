import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { verifyUser } from '../actions/login';

class App extends React.Component {
	componentDidMount() {
		const { dispatch } = this.props;
		dispatch(verifyUser());
	}

	render() {
		return (
			<div>
				Welcome to TunnelStats
				{this.props.children}
			</div>
		);
	}
}

App.propTypes = {
	children: React.PropTypes.node.isRequired,
	dispatch: PropTypes.func.isRequired
};

export default connect()(App);