/* eslint-disable react/prop-types */

import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { getRepoCommits } from '../actions/repo'

class RepoAdditionsDeletions extends React.Component {
	constructor(props) {
		super(props)
	}

	componentDidMount() {
		const { dispatch } = this.props
		dispatch(getRepoCommits())
	}

	render() {
		const Graph = this.props.graph
		const { options } = this.props

		return <Graph data={this.props.repo} xAxis={options.xAxis} yAxis={options.yAxis} />
	}
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

export default connect(mapStateToProps)(RepoAdditionsDeletions)