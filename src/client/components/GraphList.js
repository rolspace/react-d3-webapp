import GridList from '@material-ui/core/GridList'
import GridListTile from '@material-ui/core/GridListTile'
import React from 'react'
import CustomCard from './Card'

const GraphList = () => {
  return (
    <GridList cols={2} spacing={16} cellHeight="auto">
      <GridListTile>
        <CustomCard
          to="/graphs/repo-additions-deletions"
          title="Adds vs. Deletes"
          description="Groups commits based on the total lines of code that have been added or deleted"
        />
      </GridListTile>
      <GridListTile>
        <CustomCard
          to="/graphs/repo-files"
          title="Changed Files"
          description="Groups commits based on the number of files that have been modified"
        />
      </GridListTile>
      <GridListTile>
        <CustomCard to="/" title="Graph #3" description="Pending" />
      </GridListTile>
      <GridListTile>
        <CustomCard to="/" title="Graph #4" description="Pending" />
      </GridListTile>
    </GridList>
  )
}

export default GraphList
