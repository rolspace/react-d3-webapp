import React from 'react';
import Button from './Button';

class InstagramButton extends React.Component {
	logInUser() {
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