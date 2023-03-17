import CircularProgress from '@material-ui/core/CircularProgress'
import Grid from '@material-ui/core/Grid'
import { withStyles } from '@material-ui/core/styles'
import PropTypes from 'prop-types'
import React, { useEffect, useRef } from 'react'
import { renderBarGraph } from '../common/bargraph'

const styles = (theme) => ({
  circle: {
    r: 5,
  },
  container: {
    overflowX: 'scroll',
  },
  root: {
    width: '100%',
  },
  svg: {
    fontFamily: theme.typography.fontFamily,
    height: '73vh',
    minWidth: '700px',
    width: '100%',
  },
  circleRoot: {
    left: '45%',
    position: 'absolute',
    top: '50%',
  },
})

const BarGraph = ({ graphData, classes }) => {
  const { sets, colors, xAxis, xAxisLabel, yAxis, yAxisLabel, isLoading } =
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
    <div>
      <Grid container className={classes.container}>
        <Grid item xs={12} style={{ height: '75vh' }}>
          {isLoading ? (
            <CircularProgress classes={{ root: classes.circleRoot }} />
          ) : (
            <svg
              ref={svgRef}
              className={classes.svg}
              viewBox="0 0 800 500"></svg>
          )}
        </Grid>
      </Grid>
    </div>
  )
}

BarGraph.propTypes = {
  classes: PropTypes.object.isRequired,
  graphData: PropTypes.object.isRequired,
}

export default withStyles(styles)(BarGraph)
