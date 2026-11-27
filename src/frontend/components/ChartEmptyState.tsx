import Alert from '@mui/material/Alert'
import React from 'react'

interface ChartEmptyStateProps {
  message?: string
}

const ChartEmptyState: React.FC<ChartEmptyStateProps> = ({
  message = 'No commits to display for this repository.',
}) => <Alert severity="info" role="status" sx={{ my: 4 }}>{message}</Alert>

export default ChartEmptyState
