/* eslint-disable react/prop-types */

import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { getRepo } from '../actions/repo'

class RepoCommits extends React.Component {
	constructor(props) {
		super(props)
	}

	componentDidMount() {
		if (!this.props.repo.data.lastId) {
			const { dispatch } = this.props
			const owner = this.props.repo.data.owner || 'facebook'
			const name = this.props.repo.data.name || 'react'
			dispatch(getRepo(owner, name))
		}
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