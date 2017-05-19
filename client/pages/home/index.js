import React from 'react';
import InstagramButton from '../../components/InstagramButton';

class HomePage extends React.Component {
	render() {
		return (
				<div className="homepage">
					This is the HomePage
					<InstagramButton text="Login" />
				</div>
		)
	}
}

export default HomePage;