import Paper from '@mui/material/Paper'
import React, { ReactNode } from 'react'

interface ChartTooltipProps {
  id: string
  open: boolean
  /** The anchor position as a percentage of the chart container (0–100). */
  leftPct: number
  topPct: number
  children: ReactNode
}

const ChartTooltip: React.FC<ChartTooltipProps> = ({ id, open, leftPct, topPct, children }) => {
  if (!open) {
    return null
  }
  return (
    <Paper
      id={id}
      role="tooltip"
      aria-live="polite"
      elevation={3}
      sx={{
        position: 'absolute',
        left: `${leftPct}%`,
        top: `${topPct}%`,
        // Flip to the left of the anchor on the right side of the chart so the tooltip stays inside.
        transform: leftPct > 60 ? 'translate(calc(-100% - 12px), -50%)' : 'translate(12px, -50%)',
        pointerEvents: 'none',
        px: 1.5,
        py: 1,
        typography: 'body2',
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </Paper>
  )
}

export default ChartTooltip
