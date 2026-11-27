import Typography from '@mui/material/Typography'
import React from 'react'

interface ChartCoverageNoteProps {
  hasNextPage: boolean
  count: number
  subject?: string
}

const ChartCoverageNote: React.FC<ChartCoverageNoteProps> = ({ hasNextPage, count, subject = 'chart' }) =>
  hasNextPage ? (
    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
      This {subject} covers the latest {count} commits only.
    </Typography>
  ) : null

export default ChartCoverageNote
