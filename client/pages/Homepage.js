import React from 'react';
import GraphList from '../components/GraphList';

class Homepage extends React.Component {
	render() {
		return (
				<div className="homepage">
					This is the Homepage
					<GraphList />
				</div>
		)
	}
}

export default Homepage;