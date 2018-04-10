/* eslint-disable no-console */

import React from 'react'
import { connect } from 'react-redux'
import OwnerRepoForm from '../components/OwnerRepoForm'

const GraphPage = (ContainerComponent, GraphComponent, options) => {
	return connect(mapStateToProps)(class GraphPageContainer extends React.Component {
		constructor(props) {
			super(props)
			this.onFormSubmit = this.onFormSubmit.bind(this)
		}

		onFormSubmit() {
			console.log('clicked')
		}

		render() {
			return (
				<div>
					<OwnerRepoForm onFormSubmit={this.onFormSubmit} />
					<ContainerComponent graph={GraphComponent} options={options} />
				</div>
			)
		}
	})
}

const mapStateToProps = (state) => {
	return state
}

export default GraphPage