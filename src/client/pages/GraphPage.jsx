import React from 'react'
import RepoForm from '../features/repo/RepoForm.jsx'

const GraphPage = (DatasourceComponent, GraphComponent, options) => {
  return class GraphPageContainer extends React.Component {
    render() {
      return (
        <div>
          <RepoForm />
          <DatasourceComponent
            graphComponent={GraphComponent}
            options={options}
          />
        </div>
      )
    }
  }
}

export default GraphPage
