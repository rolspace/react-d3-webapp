import Grid from '@mui/material/Grid'
import { styled } from '@mui/material/styles'
import React from 'react'
import GraphList from '../components/GraphList'

const PREFIX = 'HomePage'

const classes = {
  container: `${PREFIX}-container`,
}

const Root = styled(Grid)(() => ({
  [`&.${classes.container}`]: {
    paddingTop: '80px',
  },
}))

const HomePage: React.FC = () => {
  return (
    <Root container className={classes.container} justifyContent="center">
      <Grid size={{ xs: 12, sm: 6 }}>
        <GraphList />
      </Grid>
    </Root>
  )
}

export default HomePage
