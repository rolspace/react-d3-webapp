/* eslint-disable no-console */
/* eslint-disable react/prop-types */

import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { updateRepo } from '../actions/repo'
import OwnerRepoForm from '../components/OwnerRepoForm'

const GraphPage = (ContainerComponent, GraphComponent, options) => {
	return connect(mapStateToProps)(class GraphPageContainer extends React.Component {
		constructor(props) {
			super(props)
			this.onFormSubmit = this.onFormSubmit.bind(this)
		}

		onFormSubmit(ownerValue, repoValue) {
			const { dispatch } = this.props
			dispatch(updateRepo(ownerValue, repoValue))
		}

		render() {
			return (
				<div>
					<OwnerRepoForm onFormSubmit={this.onFormSubmit} owner={this.props.repo.data.owner} repo={this.props.repo.data.repo} />
					<ContainerComponent graph={GraphComponent} options={options} {...this.props.repo} />
				</div>
			)
		}
	})
}

GraphPage.propTypes = {
	repo: PropTypes.object.isRequired
}

const mapStateToProps = (state) => {
	return {
		repo: state.repo
	}
}

export default GraphPage