import React from 'react';
import Button from './Button';

class InstagramButton extends React.Component {
	constructor(props) {
		super(props);
		this.logInUser = this.logInUser.bind(this);
	}

	logInUser() {
		window.location.replace(`https://api.instagram.com/oauth/authorize/?client_id=${process.env.CLIENT_ID}&redirect_uri=http://localhost:3000/start/&response_type=code`);
	}

	render() {
		//This button should be displayed based on the user status
		return (
			<Button text={this.props.text} click={this.logInUser} />
		)
	}
}

InstagramButton.propTypes = {
	text: React.PropTypes.string.isRequired
}

export default InstagramButton;