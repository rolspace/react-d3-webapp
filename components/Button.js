import React from 'react';

class Button extends React.Component {
	render() {
		return (
			<button>{this.props.text}</button>
		);
	}
}

Button.propTypes = {
	text: React.PropTypes.string.isRequired
}

export default Button;