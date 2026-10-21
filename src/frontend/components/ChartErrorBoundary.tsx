import Typography from '@mui/material/Typography'
import { Component, ReactNode } from 'react'

interface ChartErrorBoundaryProps {
  children: ReactNode
}

interface ChartErrorBoundaryState {
  hasError: boolean
}

// Contains a failure to a single chart so the rest of the page keeps rendering.
class ChartErrorBoundary extends Component<
  ChartErrorBoundaryProps,
  ChartErrorBoundaryState
> {
  state: ChartErrorBoundaryState = { hasError: false }

  static getDerivedStateFromError(): ChartErrorBoundaryState {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return (
        <Typography role="alert" color="text.secondary">
          Chart unavailable
        </Typography>
      )
    }

    return this.props.children
  }
}

export default ChartErrorBoundary
