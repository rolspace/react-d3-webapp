import React from 'react';
import AuthorizedOptionsList from '../../containers/AuthorizedOptionsList';

class StartPage extends React.Component {
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