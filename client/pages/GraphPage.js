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

		onFormSubmit(ownerValue, nameValue) {
			const { dispatch } = this.props
			dispatch(updateRepo(ownerValue, nameValue))
		}

		render() {
			return (
				<div>
					<OwnerRepoForm onFormSubmit={this.onFormSubmit} owner={this.props.repo.data.owner} name={this.props.repo.data.name} />
					<ContainerComponent graph={GraphComponent} options={options} />
				</div>
			)
		}
	})
}

const mapStateToProps = (state) => {
	return {
		repo: state.repo
	}
}

GraphPage.propTypes = {
	repo: PropTypes.object.isRequired
}

export default GraphPage