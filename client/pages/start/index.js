import React from 'react';
import PropTypes from 'prop-types';
import { Route } from 'react-router-dom'; 
import RecentMedia from '../recent';
import OptionsList from '../../containers/OptionsList';

class StartPage extends React.Component {
	render() {
		return (
			<div className="startpage">
				This is the Start Page!
				<OptionsList code={this.props.code} />
				<Route path="/start/recent" component={RecentMedia} />
			</div>
		)
	}
}

StartPage.propTypes = {
	children: PropTypes.node,
	code: PropTypes.string
}

export default StartPage;