import React from 'react';

class Home extends React.Component {
	render() {
		return (
			<div>
				Welcome to TunnelStats
				{this.props.children}
			</div>
		)
	}
}

export default Home