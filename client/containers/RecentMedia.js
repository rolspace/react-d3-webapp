/* eslint-disable no-unused-vars */

import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { getRecentMedia } from '../actions/media'
import RecentMediaGraphs from '../components/RecentMediaGraphs'

class RecentMedia extends React.Component {
	constructor(props) {
		super(props);
	}

	componentDidMount() {
		const { dispatch } = this.props;
		dispatch(getRecentMedia(this.props.user.id));
	}

	render() {
		// if (typeof this.props.media !== undefined && this.props.media.length > 0) {
		// 	this.renderChart();
		// }

		return <RecentMediaGraphs media={this.props.media} />
	}
}

RecentMedia.propTypes = {
	dispatch: PropTypes.func.isRequired,
	media: PropTypes.array,
	user: PropTypes.object
}

const mapStateToProps = (state) => {
	return {
		user: state.user,
		media: state.recentMedia.data
	}
}

export default connect(mapStateToProps)(RecentMedia);