import React from 'react';
import OptionsList from '../../containers/OptionsList';

class StartPage extends React.Component {	
	render() {
		return (
			<div>
				This is the Start Page!
				<OptionsList code={this.props.location.query.code} />
			</div>
		);
	}
}

export default StartPage;