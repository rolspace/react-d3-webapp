import React from 'react'
import RepoForm from '../containers/RepoForm'

const GraphPage = (DatasourceComponent, GraphComponent, options) => {
	return class GraphPageContainer extends React.Component {
		constructor(props) {
			super(props)
		}
    
		render() {
			return (
				<div>
          <RepoForm />
          <DatasourceComponent graphComponent={GraphComponent} options={options} />
				</div>
			)
		}
	}
}

export default GraphPage