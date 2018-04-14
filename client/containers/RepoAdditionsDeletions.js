/* eslint-disable react/prop-types */

import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import _ from 'lodash'
import { getRepoCommits } from '../actions/repo'

class RepoAdditionsDeletions extends React.Component {
	constructor(props) {
		super(props)
	}

	shouldComponentUpdate(nextProps) {
		if (_.isEqual(this.props.data, nextProps.data)) {
			return false
		}

		return true
	}

	componentDidUpdate(prevProps) {
		if (!_.isEqual(this.props.data, prevProps.data)) {
			const { dispatch } = this.props
			const { owner } = this.props.data
			const { repo } = this.props.data
			dispatch(getRepoCommits(owner, repo))
		}
	}

	componentDidMount() {
		const { dispatch } = this.props
		const { owner } = this.props.data
		const { repo } = this.props.data
		dispatch(getRepoCommits(owner, repo))
	}

	render() {
		const Graph = this.props.graph

		return <Graph data={this.props.data} {...this.props.options} />
	}
}

RepoAdditionsDeletions.propTypes = {
	dispatch: PropTypes.func,
	commits: PropTypes.array
}

const mapStateToProps = (state) => {
	return {
		data: state.repo.data
	}
}

export default connect(mapStateToProps)(RepoAdditionsDeletions)