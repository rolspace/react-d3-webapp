import { useTheme } from '@mui/material/styles'
import * as d3 from 'd3'
import React, { useEffect, useRef, useState } from 'react'

const CHART_HEIGHT = 200
const DEFAULT_DATA = [30, 80, 45, 60, 20, 90]

interface PlaceholderChartProps {
  title: string
  data?: number[]
}

const PlaceholderChart: React.FC<PlaceholderChartProps> = ({
  title,
  data = DEFAULT_DATA,
}) => {
  const theme = useTheme()
  const containerRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const { current: container } = containerRef
    const { current: svg } = svgRef
    if (!container || !svg) {
      return
    }

    const draw = (width: number) => {
      try {
        const selection = d3.select(svg)
        selection.selectAll('*').remove()
        selection.attr('viewBox', `0 0 ${width} ${CHART_HEIGHT}`)

        const x = d3
          .scaleBand<number>()
          .domain(data.map((_, i) => i))
          .range([0, width])
          .padding(0.2)
        const y = d3
          .scaleLinear()
          .domain([0, d3.max(data) ?? 0])
          .range([CHART_HEIGHT, 0])

        selection
          .selectAll('rect')
          .data(data)
          .join('rect')
          .attr('x', (_, i) => x(i) ?? 0)
          .attr('y', (d) => y(d))
          .attr('width', x.bandwidth())
          .attr('height', (d) => CHART_HEIGHT - y(d))
          .attr('fill', theme.palette.primary.main)
      } catch (e) {
        // Errors thrown inside useEffect bypass error boundaries, so hand them to render.
        setError(e instanceof Error ? e : new Error(String(e)))
      }
    }

    draw(container.clientWidth)

    const observer = new ResizeObserver((entries) => {
      draw(entries[0].contentRect.width)
    })
    observer.observe(container)

    return () => {
      observer.disconnect()
      d3.select(svg).selectAll('*').remove()
    }
  }, [data, theme.palette.primary.main])

  if (error) {
    throw error
  }

  return (
    <div ref={containerRef} style={{ width: '100%', minWidth: 0 }}>
      <svg
        ref={svgRef}
        role="img"
        aria-label={`Placeholder chart for ${title}`}
        style={{ display: 'block', width: '100%', maxWidth: '100%', height: CHART_HEIGHT }}
      />
    </div>
  )
}

export default PlaceholderChart
