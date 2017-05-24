import React, { PropTypes } from 'react';
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