import React from 'react'
import RepositoryForm from '../containers/RepositoryForm'

const GraphPage = (ContainerComponent, GraphComponent, options) => {
	return class GraphPageContainer extends React.Component {
		constructor(props) {
			super(props)
		}
    
		render() {
			return (
				<div>
          <RepositoryForm />
          <ContainerComponent graph={GraphComponent} options={options} />
				</div>
			)
		}
	}
}

export default GraphPage