import React from 'react'
import PropTypes from 'prop-types'

const Button = () => {
	return (
		<button onClick={this.props.click}>{this.props.text}</button>
	)
}

Button.propTypes = {
	click: PropTypes.func.isRequired,
	text: PropTypes.string.isRequired
}

export default Button