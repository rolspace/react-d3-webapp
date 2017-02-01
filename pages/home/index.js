import React from 'react';
import InstagramButton from '../../components/InstagramButton';

class HomePage extends React.Component {
	render() {
		return (
			<div>
				<div>
				This is the HomePage
				</div>
				<InstagramButton text="Login" />
			</div>
		);
	}
}

export default HomePage;