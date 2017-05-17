import React, { PropTypes } from 'react';

class Option extends React.Component {
	render() {
		return (
			<div>{this.props.name}</div>
		);
	}
}

Option.propTypes = {
	name: PropTypes.string.isRequired
}

export default Option;