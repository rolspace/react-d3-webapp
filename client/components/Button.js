import React from 'react';

class Button extends React.Component {
	render() {
		return (
			<button onClick={this.props.click}>{this.props.text}</button>
		);
	}
}

Button.propTypes = {
	click: React.PropTypes.func,
	text: React.PropTypes.string.isRequired	
}

export default Button;