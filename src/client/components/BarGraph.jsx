import CircularProgress from '@mui/material/CircularProgress'
import Grid from '@mui/material/Grid'
import { styled } from '@mui/material/styles'
import PropTypes from 'prop-types'
import React, { useEffect, useRef } from 'react'
import { renderBarGraph } from '../services/bargraph.js'

const PREFIX = 'BarGraph'

const classes = {
  circle: `${PREFIX}-circle`,
  container: `${PREFIX}-container`,
  root: `${PREFIX}-root`,
  svg: `${PREFIX}-svg`,
  circleRoot: `${PREFIX}-circleRoot`,
}

const Root = styled('div')((
  {
    theme,
  },
) => ({
  [`& .${classes.circle}`]: {
    r: 5,
  },

  [`& .${classes.container}`]: {
    overflowX: 'scroll',
  },

  [`& .${classes.root}`]: {
    width: '100%',
  },

  [`& .${classes.svg}`]: {
    fontFamily: theme?.typography?.fontFamily,
    height: '73vh',
    minWidth: '700px',
    width: '100%',
  },

  [`& .${classes.circleRoot}`]: {
    left: '45%',
    position: 'absolute',
    top: '50%',
  },
}))

const BarGraph = ({ graphData }) => {
  const { sets, colors, loading, xAxis, xAxisLabel, yAxis, yAxisLabel } =
    graphData

  const svgRef = useRef(null)

  useEffect(() => {
    const renderGraph = () => {
      const { current: node } = svgRef

      if (node && sets) {
        renderBarGraph(node, {
          sets,
          colors,
          xAxis,
          xAxisLabel,
          yAxis,
          yAxisLabel,
          height: 500,
          width: 800,
        })
      }
    }

    renderGraph()
  }, [graphData])

  return (
    <Root>
      <Grid container className={classes.container}>
        <Grid size={12} style={{ height: '75vh' }}>
          {loading === 'pending' ? (
            <CircularProgress classes={{ root: classes.circleRoot }} />
          ) : (
            <svg
              ref={svgRef}
              className={classes.svg}
              viewBox="0 0 800 500"
            />
          )}
        </Grid>
      </Grid>
    </Root>
  )
}

BarGraph.propTypes = {
  classes: PropTypes.object.isRequired,
  graphData: PropTypes.object.isRequired,
}

export default BarGraph
