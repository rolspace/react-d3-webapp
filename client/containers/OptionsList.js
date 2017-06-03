/* eslint-disable no-console */

import React from 'react';
import Option from '../components/Option';

class OptionsList extends React.Component {
	render() {
		return (
			<div className="options">
				<Option name="option1" />
				<Option name="option2" />
				<Option name="option3" />
				<Option name="option4" />
			</div>
		)
	}
}

export default OptionsList;