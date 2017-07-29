import React from 'react';
import { Route } from 'react-router-dom';
import RecentMediaPage from '../recent';
import OptionsList from '../../components/OptionsList';

class StartPage extends React.Component {
	render() {
		return (
			<div className="startpage">
				This is the Start Page!
				<OptionsList />
				<Route path="/start/recent" component={RecentMediaPage} />
			</div>
		)
	}
}

export default StartPage;