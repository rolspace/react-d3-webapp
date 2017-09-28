/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */

import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { getMedia } from '../actions/media'

const RecentMedia = (Graph, xAxis, yAxis) => {
	return connect(mapStateToProps)(class RecentMediaContainer extends React.Component {
		constructor(props) {
			super(props)
		}

		componentDidMount() {
			const { dispatch } = this.props;
			dispatch(getMedia(this.props.user.id))
		}

		render() {
			return <Graph data={this.props.media} xAxis={xAxis} yAxis={yAxis} />
		}
	})
}

RecentMedia.propTypes = {
	dispatch: PropTypes.func,
	media: PropTypes.array,
	user: PropTypes.object
}

const mapStateToProps = (state) => {
	return {
		media: state.recentMedia.data,
		user: state.user
	}
}

export default RecentMedia