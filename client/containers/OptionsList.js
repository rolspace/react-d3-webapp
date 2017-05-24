/* eslint-disable no-console */

import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { loginUser } from '../actions/user';
import Option from '../components/Option';

class OptionsList extends React.Component {
	componentDidMount() {
		if (this.props.code) {
			const { dispatch } = this.props;
			dispatch(loginUser(this.props.code));
		}
	}

	render() {
		if (this.props.user.login) {
			return (
				<div className="options">
					<Option name="option1" />
					<Option name="option2" />
					<Option name="option3" />
					<Option name="option4" />
				</div>
			)
		}
		else {
			return null;
		}
	}
}

OptionsList.propTypes = {
	code: PropTypes.string,
	dispatch: PropTypes.func.isRequired,
	user: PropTypes.object
}

const mapStateToProps = (state) => {
	return {
		user: state.user
	}
}

export default connect(mapStateToProps)(OptionsList);