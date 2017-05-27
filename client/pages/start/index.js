import React from 'react';
import PropTypes from 'prop-types';
import OptionsList from '../../containers/OptionsList';

class StartPage extends React.Component {
	render() {
		return (
			<div className="startpage">
				This is the Start Page!
				<OptionsList code={this.props.location.query.code} />
				{this.props.children}
			</div>
		)
	}
}

StartPage.propTypes = {
	children: PropTypes.node,
}

export default StartPage;