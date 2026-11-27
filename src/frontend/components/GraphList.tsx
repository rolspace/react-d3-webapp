import ImageList from '@mui/material/ImageList'
import ImageListItem from '@mui/material/ImageListItem'
import CustomCard from './Card'

const GraphList: React.FC = () => {
  return (
    <ImageList cols={2} gap={16} rowHeight="auto">
      <ImageListItem>
        <CustomCard
          to="/graphs/repo-additions-deletions"
          title="Adds / Deletes"
          description="Groups commits based on the total added/deleted LOC"
        />
      </ImageListItem>
      <ImageListItem>
        <CustomCard
          to="/graphs/repo-files"
          title="Changed Files"
          description="Groups commits based on the number of modified files"
        />
      </ImageListItem>
      <ImageListItem>
        <CustomCard
          to="/graphs/repo-commit-size"
          title="Commit Size Distribution"
          description="Share of commits at or below each size"
        />
      </ImageListItem>
      <ImageListItem>
        <CustomCard
          to="/graphs/repo-commits-per-week"
          title="Commits per Week"
          description="Weekly commit activity over the loaded commits"
        />
      </ImageListItem>
    </ImageList>
  )
}

export default GraphList
