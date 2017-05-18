import React from 'react';

class App extends React.Component {
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
};

export default App;