import React from 'react'
import RepoForm from '../features/repo/RepoForm'

interface GraphPageProps {
  graphComponent: React.ComponentType<any>
}

const GraphPage = (
  DatasourceComponent: React.FC<GraphPageProps>,
  GraphComponent: React.FC<any>,
) => {
  return class GraphPageContainer extends React.Component {
    render() {
      return (
        <div>
          <RepoForm />
          <DatasourceComponent
            graphComponent={GraphComponent}
          />
        </div>
      )
    }
  }
}

export default GraphPage
