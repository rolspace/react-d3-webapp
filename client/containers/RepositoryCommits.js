/* eslint-disable react/prop-types */
import React from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'
import { connect } from 'react-redux'
import { changeScreen } from '../actions/ui'
import { fetchRepository } from '../actions/repo'

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
			const { owner, name } = this.props.repo
			dispatch(fetchRepository(owner, name))
		}
	}
  
	componentDidMount() {
		const { dispatch } = this.props
    
		if (!this.props.repo.isFetching && !this.props.repo.isComplete) {
			const owner = this.props.repo.owner || 'facebook'
			const name = this.props.repo.name || 'react'
			dispatch(fetchRepository(owner, name))
		}
    
		dispatch(changeScreen({ screen: this.props.graph.name }))
	}
  
	componentWillUnmount() {
		const { dispatch } = this.props
		dispatch(changeScreen({ screen: '' }))
	}
  
	render() {
		const GraphComponent = this.props.graphComponent
		const error = this.props.repo.error
		const isLoading = this.props.repo.isFetching && !this.props.repo.isComplete
    
		return <GraphComponent data={this.props.repo.commits} {...this.props.options} isLoading={isLoading} error={error} />
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