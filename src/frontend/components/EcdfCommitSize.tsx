import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import FormLabel from '@mui/material/FormLabel'
import Stack from '@mui/material/Stack'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import Typography from '@mui/material/Typography'
import * as d3 from 'd3'
import React, { useEffect, useId, useMemo, useRef, useState } from 'react'
import { CHART_HEIGHT, CHART_MARGINS, CHART_WIDTH } from '../services/chartScaffold'
import { createEcdfLayout, EcdfSeries, renderEcdfChart } from '../services/ecdfChart'
import { RepoGraphProps } from '../types/graph.types'
import { Status } from '../types/state.types'
import { BinScale } from '../utils/binning'
import { computeEcdf, ecdfAt, ecdfQuantile, ecdfStops } from '../utils/ecdf'
import ChartCoverageNote from './ChartCoverageNote'
import ChartEmptyState from './ChartEmptyState'
import ChartTooltip from './ChartTooltip'
import ScaleToggle from './ScaleToggle'

export type EcdfMetric = 'addsDeletes' | 'additions' | 'deletions' | 'changedFiles'

type SeriesConfig = Pick<EcdfSeries, 'key' | 'label' | 'color' | 'dash'> & { unit: string }

// Each color has at least 3:1 contrast against white (WCAG AA for graphics).
// #00838f replaces the histogram's #00bcd4, which is about 2.3:1.
const SERIES: Record<SeriesConfig['key'], SeriesConfig> = {
  additions: { key: 'additions', label: 'Additions', color: '#2da44e', unit: 'lines' },
  deletions: { key: 'deletions', label: 'Deletions', color: '#cf222e', dash: '6 4', unit: 'lines' },
  changedFiles: { key: 'changedFiles', label: 'Changed files', color: '#00838f', unit: 'files' },
}

const METRICS: Record<EcdfMetric, { label: string; xLabel: string; series: SeriesConfig[] }> = {
  addsDeletes: { label: 'Adds + Deletes', xLabel: 'Lines changed per commit', series: [SERIES.additions, SERIES.deletions] },
  additions: { label: 'Additions', xLabel: 'Lines added per commit', series: [SERIES.additions] },
  deletions: { label: 'Deletions', xLabel: 'Lines deleted per commit', series: [SERIES.deletions] },
  changedFiles: { label: 'Changed files', xLabel: 'Files changed per commit', series: [SERIES.changedFiles] },
}

const METRIC_ORDER: EcdfMetric[] = ['addsDeletes', 'additions', 'deletions', 'changedFiles']

const Y_LABEL = 'Share of commits at or below x'
const formatPct = d3.format('.1%')
const formatNum = d3.format(',')

const EcdfCommitSize: React.FC<RepoGraphProps> = ({ commits, hasNextPage, status }) => {
  const [metric, setMetric] = useState<EcdfMetric>('addsDeletes')
  const [scale, setScale] = useState<BinScale>('linear')
  const [cursor, setCursor] = useState<number | null>(null)
  const plotRef = useRef<SVGGElement>(null)
  const tooltipId = useId()
  const metricLabelId = useId()

  const { [metric]: metricConfig } = METRICS
  const { label: metricLabel, xLabel, series: configs } = metricConfig
  const [{ unit }] = configs

  const series = useMemo<EcdfSeries[]>(() => configs.map((cfg) => {
    const ecdf = computeEcdf(commits.map((c) => c[cfg.key]))
    return { ...cfg, ecdf, median: ecdfQuantile(ecdf, 0.5), p90: ecdfQuantile(ecdf, 0.9) }
  }), [commits, configs])

  const layout = useMemo(() => createEcdfLayout(series, scale), [series, scale])
  const stops = useMemo(() => ecdfStops(series.map((s) => s.ecdf)), [series])

  useEffect(() => {
    if (plotRef.current && layout) {
      renderEcdfChart(plotRef.current, series, layout, { x: xLabel, y: Y_LABEL })
    }
  }, [series, layout, xLabel])

  if (status === Status.Pending) {
    return <CircularProgress sx={{ display: 'block', mx: 'auto', my: 8 }} />
  }
  if (!layout) {
    return <ChartEmptyState />
  }

  const clamp = (v: number) => Math.min(layout.domain[1], Math.max(layout.domain[0], v))

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    if (rect.width === 0) {
      return
    }
    const px = ((e.clientX - rect.left) / rect.width) * CHART_WIDTH - CHART_MARGINS.left
    setCursor(clamp(Math.round(layout.x.invert(px))))
  }

  const handleKeyDown = (e: React.KeyboardEvent<SVGSVGElement>) => {
    if (stops.length === 0) {
      return
    }
    const last = stops.length > 0 ? stops[stops.length - 1] : undefined
    const [first] = stops
    let next: number | null | undefined
    switch (e.key) {
      case 'ArrowRight': next = cursor === null ? stops[0] : stops[d3.bisectRight(stops, cursor)] ?? last; break
      case 'ArrowLeft': next = cursor === null ? stops[0] : stops[d3.bisectLeft(stops, cursor) - 1] ?? stops[0]; break
      case 'Home': next = first; break
      case 'End': next = last; break
      case 'Escape': next = null; break
      default: return
    }
    e.preventDefault()
    setCursor(next ?? null)
  }

  const cursorX = cursor === null ? 0 : CHART_MARGINS.left + layout.x(cursor)

  return (
    <Box>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={4} sx={{ alignItems: 'flex-start', mb: 2 }}>
        <Stack>
          <FormLabel id={metricLabelId}>Metric</FormLabel>
          <ToggleButtonGroup
            aria-labelledby={metricLabelId}
            exclusive
            size="small"
            value={metric}
            onChange={(_, next: EcdfMetric | null) => {
              if (next) {
                setMetric(next)
                setCursor(null)
              }
            }}
          >
            {METRIC_ORDER.map((m) => (
              <ToggleButton key={m} value={m}>{METRICS[m].label}</ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Stack>
        <ScaleToggle
          value={scale}
          onChange={(next) => {
            setScale(next)
            setCursor(null)
          }}
        />
      </Stack>

      <Stack component="ul" direction="row" spacing={3} sx={{ listStyle: 'none', p: 0, mb: 1, flexWrap: 'wrap' }}>
        {series.map((s) => (
          <Stack key={s.key} component="li" direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <svg width={24} height={4} aria-hidden="true">
              <line x1={0} x2={24} y1={2} y2={2} stroke={s.color} strokeWidth={2} strokeDasharray={s.dash} />
            </svg>
            <Typography variant="body2">
              {s.label}: median {s.median === null ? '–' : formatNum(s.median)} · 90th pct {s.p90 === null ? '–' : formatNum(s.p90)} {unit}
            </Typography>
          </Stack>
        ))}
      </Stack>

      <ChartCoverageNote hasNextPage={hasNextPage} count={commits.length} subject="chart" />

      <Box sx={{ position: 'relative', overflowX: 'auto' }}>
        <svg
          viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
          style={{ display: 'block', width: '100%', minWidth: 700, height: 'auto' }}
          role="img"
          aria-label={`Cumulative distribution of ${metricLabel.toLowerCase()} per commit. Use the left and right arrow keys to read values.`}
          aria-describedby={cursor !== null ? tooltipId : undefined}
          tabIndex={0}
          onPointerMove={handlePointerMove}
          onPointerLeave={() => setCursor(null)}
          onFocus={() => setCursor(series[0].median ?? stops[0])}
          onBlur={() => setCursor(null)}
          onKeyDown={handleKeyDown}
        >
          <g ref={plotRef} />
          {cursor !== null && (
            <line
              className="ecdf-cursor"
              x1={cursorX} x2={cursorX}
              y1={CHART_MARGINS.top} y2={CHART_MARGINS.top + layout.innerHeight}
              stroke="#24292f" strokeWidth={1} pointerEvents="none"
            />
          )}
        </svg>
        <ChartTooltip
          id={tooltipId}
          open={cursor !== null}
          leftPct={(cursorX / CHART_WIDTH) * 100}
          topPct={((CHART_MARGINS.top + layout.y(0.5)) / CHART_HEIGHT) * 100}
        >
          <strong>{cursor !== null && `≤ ${formatNum(cursor)} ${unit}`}</strong>
          {cursor !== null && series.map((s) => (
            <div key={s.key}>{s.label}: {formatPct(ecdfAt(s.ecdf, cursor))} of commits</div>
          ))}
        </ChartTooltip>
      </Box>
    </Box>
  )
}

export default EcdfCommitSize
