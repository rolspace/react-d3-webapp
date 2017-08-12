/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */

import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { getRecentMedia } from '../actions/media'

const RecentMedia = (Graph) => {
	return connect(mapStateToProps)(class RecentMediaContainer extends React.Component {
		constructor(props) {
			super(props)
		}

		componentDidMount() {
			const { dispatch } = this.props;
			dispatch(getRecentMedia(this.props.user.id))
		}

		render() {
			return <Graph media={this.props.media} />
		}
	})
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

export default RecentMedia