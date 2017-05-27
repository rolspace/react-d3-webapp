import React from 'react';
import PropTypes from 'prop-types';

class Button extends React.Component {
	render() {
		return (
			<button onClick={this.props.click}>{this.props.text}</button>
		)
	}
}

Button.propTypes = {
	click: PropTypes.func,
	text: PropTypes.string.isRequired	
}

export default Button;