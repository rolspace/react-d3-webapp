import React from 'react';
import PropTypes from 'prop-types';
import Button from './Button';

class InstagramButton extends React.Component {
	constructor(props) {
		super(props);
		this.logInUser = this.logInUser.bind(this);
	}

	logInUser() {
		window.location.replace(`${process.env.INSTAGRAM_API}?client_id=${process.env.INSTAGRAM_CLIENTID}&redirect_uri=${process.env.INSTAGRAM_REDIRECT}&response_type=code`);
	}

	render() {
		return (
			<Button text={this.props.text} click={this.logInUser} />
		)
	}
}

InstagramButton.propTypes = {
	text: PropTypes.string.isRequired
}

export default InstagramButton;
