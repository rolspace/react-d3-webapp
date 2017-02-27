/* eslint-disable no-console */

import React from 'react';
import AuthorizedOptionsList from '../../containers/AuthorizedOptionsList';

class StartPage extends React.Component {	
	render() {
		return (
			<div>
				This is the Start Page!
				<AuthorizedOptionsList code={this.props.location.query.code} />
			</div>
		);
	}
}

export default StartPage;