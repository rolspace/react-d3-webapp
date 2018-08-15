import React from 'react'
import RepositoryForm from '../containers/RepositoryForm'

const GraphPage = (DatasourceComponent, GraphComponent, options) => {
	return class GraphPageContainer extends React.Component {
		constructor(props) {
			super(props)
		}
    
		render() {
			return (
				<div>
          <RepositoryForm />
          <DatasourceComponent graphComponent={GraphComponent} options={options} />
				</div>
			)
		}
	}
}

export default GraphPage