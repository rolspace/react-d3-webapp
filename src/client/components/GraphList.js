import ImageList from '@material-ui/core/ImageList'
import ImageListItem from '@material-ui/core/ImageListItem'
import React from 'react'
import CustomCard from './Card'

const GraphList = () => {
  return (
    <ImageList cols={2} gap={16} rowHeight="auto">
      <ImageListItem>
        <CustomCard
          to="/graphs/repo-additions-deletions"
          title="Adds vs. Deletes"
          description="Groups commits based on the total lines of code that have been added or deleted"
        />
      </ImageListItem>
      <ImageListItem>
        <CustomCard
          to="/graphs/repo-files"
          title="Changed Files"
          description="Groups commits based on the number of files that have been modified"
        />
      </ImageListItem>
      <ImageListItem>
        <CustomCard to="/" title="Graph #3" description="Pending" />
      </ImageListItem>
      <ImageListItem>
        <CustomCard to="/" title="Graph #4" description="Pending" />
      </ImageListItem>
    </ImageList>
  )
}

export default GraphList
