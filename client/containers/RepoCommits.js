/* eslint-disable react/prop-types */

import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { changeScreen } from '../actions/ui'
import { getRepo } from '../actions/repo'

class RepoCommits extends React.Component {
	constructor(props) {
		super(props)
	}

	componentDidMount() {
		const { dispatch } = this.props

		if (!this.props.repo.data.lastId) {
			const owner = this.props.repo.data.owner || 'facebook'
			const name = this.props.repo.data.name || 'react'
			dispatch(getRepo(owner, name))
		}

		dispatch(changeScreen({ screen: this.props.ui.graph }))
	}

	render() {
		const Graph = this.props.graph

		return <Graph data={this.props.repo.data} {...this.props.options} />
	}
}

RepoCommits.propTypes = {
	dispatch: PropTypes.func.isRequired,
	repo: PropTypes.object.isRequired
}

const mapStateToProps = (state) => {
	return {
		repo: state.repo,
		ui: state.ui
	}
}

export default connect(mapStateToProps)(RepoCommits)