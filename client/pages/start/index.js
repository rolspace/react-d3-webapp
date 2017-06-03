import React from 'react';
import { Route } from 'react-router-dom'; 
import RecentMedia from '../recent';
import OptionsList from '../../containers/OptionsList';

class StartPage extends React.Component {
	render() {
		return (
			<div className="startpage">
				This is the Start Page!
				<OptionsList />
				<Route path="/start/recent" component={RecentMedia} />
			</div>
		)
	}
}

export default StartPage;