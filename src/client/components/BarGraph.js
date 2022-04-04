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

const BarGraph = ({ classes, data }) => {
  const svgRef = useRef(null)

  useEffect(() => {
    const renderGraph = () => {
      const node = svgRef.current

      if (node && data && data.sets) {
        const graphData = {
          sets: data.sets,
          xAxis: data.xAxis,
          yAxis: data.yAxis,
          xAxisLabel: data.xAxisLabel,
          yAxisLabel: data.yAxisLabel,
          height: 500,
          width: 800,
        }

        renderBarGraph(node, graphData)
      }
    }

    renderGraph()
  }, [data])

  return (
    <div>
      <Grid container className={classes.container}>
        <Grid item xs={12} style={{ height: '75vh' }}>
          {data.isLoading ? (
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
  data: PropTypes.object.isRequired,
}

export default withStyles(styles)(BarGraph)
