import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router'

class Option extends React.Component {
	render() {
		return (
			<div>
				{this.props.name}: <Link to="/start/recent">Recent</Link>
			</div>
		)
	}
}

Option.propTypes = {
	name: PropTypes.string.isRequired
}

export default Option;