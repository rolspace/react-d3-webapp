/* eslint-disable react/prop-types */

import React from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'
import { connect } from 'react-redux'
import { changeScreen } from '../actions/ui'
import { getRepo } from '../actions/repo'

class RepositoryCommits extends React.Component {
	constructor(props) {
		super(props)
	}

	shouldComponentUpdate(nextProps) {
		if (!_.isEqual(this.props.repo, nextProps.repo)) {
			return true
		}

		if (this.props.ui.screen !== nextProps.ui.screen) {
			return true
		}

		return false
	}

	componentDidUpdate() {
		const { dispatch } = this.props

		if (!this.props.repo.isFetching && !this.props.repo.isComplete) {
			const { owner, name } = this.props.repo.data
			dispatch(getRepo(owner, name))
		}
	}

	componentDidMount() {
		const { dispatch } = this.props

		if (!this.props.repo.isFetching && !this.props.repo.isComplete) {
			const owner = this.props.repo.data.owner || 'facebook'
			const name = this.props.repo.data.name || 'react'
			dispatch(getRepo(owner, name))
		}

		dispatch(changeScreen({ screen: this.props.graph.name }))
	}

	render() {
		const Graph = this.props.graph
    const error = this.props.repo.error
    const loading = this.props.repo.isFetching && !this.props.repo.isComplete

		return <Graph data={this.props.repo.data} {...this.props.options} loading={loading} error={error} />
	}
}

RepositoryCommits.propTypes = {
	dispatch: PropTypes.func.isRequired,
	repo: PropTypes.object.isRequired
}

const mapStateToProps = (state) => {
	return {
		repo: state.repo,
		ui: state.ui
	}
}

export default connect(mapStateToProps)(RepositoryCommits)