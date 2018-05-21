/* eslint-disable react/prop-types */

import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import _ from 'lodash'
import { getRepo, updateRepo } from '../actions/repo'

class RepoCommits extends React.Component {
	constructor(props) {
		super(props)
	}

	shouldComponentUpdate(nextProps) {
		if (!_.isEqual(this.props.repo.data, nextProps.repo.data)) {
			return true
		}

		return false
	}

	componentDidUpdate() {
		if (!this.props.repo.data.lastId && !this.props.repo.data.lastDate) {
			const { dispatch } = this.props
			const { owner } = this.props.repo.data
			const { name } = this.props.repo.data
			dispatch(getRepo(owner, name))
		}
	}

	componentDidMount() {
		const { dispatch } = this.props
		const { owner } = this.props.repo.data
		const { name } = this.props.repo.data
		dispatch(updateRepo(owner || 'facebook', name || 'react'))
	}

	render() {
		const Graph = this.props.graph

		return <Graph data={this.props.repo.data} {...this.props.options} />
	}
}

RepoCommits.propTypes = {
	dispatch: PropTypes.func,
	commits: PropTypes.array
}

const mapStateToProps = (state) => {
	return {
		repo: state.repo
	}
}

export default connect(mapStateToProps)(RepoCommits)