import React from 'react';

class App extends React.Component {
	render() {
		return (
			<div>
				Welcome to TunnelStats
				{this.props.children}
			</div>
		)
	}
}

export default App