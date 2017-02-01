import React from 'react';
import Button from './Button';

class InstagramButton extends React.Component {
	logInUser() {
		window.location.replace(`https://api.instagram.com/oauth/authorize/?client_id=${process.env.CLIENT_ID}&redirect_uri=http://localhost:3000/start&response_type=code`);
		return true;
	}

	render() {
		return (
			<Button text={this.props.text} onClick={this.logInUser} />
		);
	}
}

InstagramButton.propTypes = {
	text: React.PropTypes.string.isRequired
}

export default InstagramButton;