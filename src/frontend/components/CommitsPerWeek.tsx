import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Typography from '@mui/material/Typography'
import * as d3 from 'd3'
import React, { useEffect, useId, useMemo, useRef, useState } from 'react'
import { useContainerWidth } from '../hooks/useContainerWidth'
import { CHART_MARGINS, CHART_WIDTH } from '../services/chartScaffold'
import { createWeeklyLayout, renderWeeklyChart } from '../services/weeklyChart'
import { RepoGraphProps } from '../types/graph.types'
import { Status } from '../types/state.types'
import { groupCommitsByWeek } from '../utils/weekly'
import ChartCoverageNote from './ChartCoverageNote'
import ChartEmptyState from './ChartEmptyState'
import ChartTooltip from './ChartTooltip'

const X_LABEL = 'Week starting (UTC)'
const Y_LABEL = 'Commits'
const formatDay = d3.utcFormat('%b %-d, %Y')
const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`

const CommitsPerWeek: React.FC<RepoGraphProps> = ({ commits, hasNextPage, status }) => {
  const [container, setContainer] = useState<HTMLDivElement | null>(null)
  const [active, setActive] = useState<number | null>(null)
  const plotRef = useRef<SVGGElement>(null)
  const tooltipId = useId()
  const width = useContainerWidth(container, CHART_WIDTH)

  const weekly = useMemo(() => groupCommitsByWeek(commits), [commits])
  const { weeks, datedCount, excludedCount, firstDate, lastDate } = weekly
  const layout = useMemo(() => createWeeklyLayout(weeks, width), [weeks, width])

  useEffect(() => {
    if (plotRef.current && layout) {
      renderWeeklyChart(plotRef.current, weeks, layout, { x: X_LABEL, y: Y_LABEL })
    }
  }, [weeks, layout, status])

  // Reset the cursor when the data changes so it never points past the end.
  useEffect(() => {
    setActive(null)
  }, [weeks])

  if (status === Status.Pending) {
    return <CircularProgress sx={{ display: 'block', mx: 'auto', my: 8 }} />
  }
  if (commits.length === 0) {
    return <ChartEmptyState />
  }

  const exclusionNote = excludedCount > 0 && (
    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
      {plural(excludedCount, 'commit')} without a valid date {excludedCount === 1 ? 'is' : 'are'} not shown.
    </Typography>
  )

  if (!layout || !firstDate || !lastDate) {
    return (
      <Box>
        <ChartEmptyState message="No dated commits are available for this repository." />
        {exclusionNote}
      </Box>
    )
  }

  const { left: marginLeft, top: marginTop } = CHART_MARGINS
  const lastIndex = weeks.length - 1

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    if (rect.width === 0) {
      return
    }
    const px = ((e.clientX - rect.left) / rect.width) * layout.width - marginLeft
    const index = Math.floor(px / layout.slotWidth)
    setActive(index >= 0 && index <= lastIndex ? index : null)
  }

  const handleKeyDown = (e: React.KeyboardEvent<SVGSVGElement>) => {
    let next: number | null
    switch (e.key) {
      case 'ArrowRight': next = active === null ? 0 : Math.min(lastIndex, active + 1); break
      case 'ArrowLeft': next = active === null ? 0 : Math.max(0, active - 1); break
      case 'Home': next = 0; break
      case 'End': next = lastIndex; break
      case 'Escape': next = null; break
      default: return
    }
    e.preventDefault()
    setActive(next)
  }

  const activeWeek = active === null ? null : weeks[active]
  const slotX = active === null ? 0 : marginLeft + active * layout.slotWidth

  return (
    <Box>
      <Typography variant="body2" sx={{ mb: 1 }}>
        {plural(datedCount, 'commit')} from {formatDay(firstDate)} to {formatDay(lastDate)}
      </Typography>
      {exclusionNote}
      <ChartCoverageNote hasNextPage={hasNextPage} count={commits.length} />

      <Box ref={setContainer} sx={{ position: 'relative', width: '100%', minWidth: 0 }}>
        <svg
          viewBox={`0 0 ${layout.width} ${layout.height}`}
          style={{ display: 'block', width: '100%', height: 'auto' }}
          role="img"
          aria-label={`Bar chart of commits per week from ${formatDay(firstDate)} to ${formatDay(lastDate)}: ${plural(datedCount, 'commit')} across ${plural(weeks.length, 'week')}. Use the left and right arrow keys to read weekly counts.`}
          aria-describedby={activeWeek ? tooltipId : undefined}
          tabIndex={0}
          onPointerMove={handlePointerMove}
          onPointerLeave={() => setActive(null)}
          onFocus={() => setActive(lastIndex)}
          onBlur={() => setActive(null)}
          onKeyDown={handleKeyDown}
        >
          <g ref={plotRef} />
          {activeWeek && (
            <rect
              className="weekly-highlight"
              x={slotX} y={marginTop} width={layout.slotWidth} height={layout.innerHeight}
              fill="#24292f" fillOpacity={0.08} pointerEvents="none"
            />
          )}
        </svg>
        <ChartTooltip
          id={tooltipId}
          open={activeWeek !== null}
          leftPct={((slotX + layout.slotWidth / 2) / layout.width) * 100}
          topPct={((marginTop + layout.innerHeight / 2) / layout.height) * 100}
        >
          {activeWeek && (
            <>
              <strong>Week of {formatDay(activeWeek.weekStart)}</strong>
              <div>{plural(activeWeek.count, 'commit')}</div>
            </>
          )}
        </ChartTooltip>
      </Box>
    </Box>
  )
}

export default CommitsPerWeek
