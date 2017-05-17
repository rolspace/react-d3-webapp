import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { loginUser } from '../actions/user';
import Option from '../components/Option';

class OptionsList extends React.Component {
	componentDidMount() {
		const { dispatch } = this.props;
		dispatch(loginUser(this.props.code));
	}

	render() {
		return (
			<div className="options">
				<Option name="option1" />
				<Option name="option2" />
				<Option name="option3" />
				<Option name="option4" />
			</div>
		);
	}
}

OptionsList.propTypes = {
	dispatch: PropTypes.func.isRequired
}

export default connect()(OptionsList);