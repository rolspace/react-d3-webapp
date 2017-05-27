import React from 'react';
import PropTypes from 'prop-types';

class App extends React.Component {
	render() {
		return (
			<div className="app">
				Welcome to TunnelStats
				{this.props.children}
			</div>
		)
	}
}

App.propTypes = {
	children: PropTypes.node.isRequired,
}

export default App;