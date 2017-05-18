import React from 'react';
import Authorize from '../../containers/Authorize';
import OptionsList from '../../containers/OptionsList';

class StartPage extends React.Component {
	render() {
		return (
			<div className="startpage">
				<Authorize />
				This is the Start Page!
				<OptionsList code={this.props.location.query.code} />
			</div>
		);
	}
}

export default StartPage;