/* eslint-disable no-console */

import React from 'react';
import AuthorizedOptionsList from '../../containers/AuthorizedOptionsList';

class StartPage extends React.Component {
	componentDidMount() {
		console.log(this.props.location.query.code);
	}
	
	render() {
		return (
			<div>
				This is the Start Page!
				<AuthorizedOptionsList />
			</div>
		);
	}
}

export default StartPage;