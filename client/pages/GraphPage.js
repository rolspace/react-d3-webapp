import React from 'react'
import OwnerRepoForm from '../components/OwnerRepoForm'

const GraphPage = (ContainerComponent, GraphComponent, options) => {
	return class GraphPageContainer extends React.Component {
		constructor(props) {
			super(props)
		}

		render() {
			return (
				<div>
					<OwnerRepoForm />
					<ContainerComponent graph={GraphComponent} options={options} />
				</div>
			)
		}
	}
}

export default GraphPage