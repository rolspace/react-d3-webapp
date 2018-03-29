/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
/* eslint-disable no-console */

import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { getRepoCommits } from '../actions/repo'

const RepoAdditionsDeletions = (Graph, xAxis, yAxis) => {
	return connect(mapStateToProps)(class RepoAdditionsDeletionsContainer extends React.Component {
		constructor(props) {
			super(props)
		}

		componentDidMount() {
			const { dispatch } = this.props;
			dispatch(getRepoCommits())
		}

		render() {
			return <Graph data={this.props.repo} xAxis={xAxis} yAxis={yAxis} />
		}
	})
}

RepoAdditionsDeletions.propTypes = {
	dispatch: PropTypes.func,
	commits: PropTypes.array
}

const mapStateToProps = (state) => {
	return {
		repo: state.repo.data
	}
}

export default RepoAdditionsDeletions