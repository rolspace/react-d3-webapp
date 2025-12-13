import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import { styled } from '@mui/material/styles'
import React from 'react'

const PREFIX = 'Login'

const classes = {
  container: `${PREFIX}-container`,
  content: `${PREFIX}-content`,
  title: `${PREFIX}-title`,
  button: `${PREFIX}-button`,
}

const Root = styled(Grid)(({ theme }) => ({
  [`&.${classes.container}`]: {
    minHeight: '100vh',
    backgroundColor: theme.palette.background.default,
  },
  [`& .${classes.content}`]: {
    textAlign: 'center',
    padding: theme.spacing(4),
  },
  [`& .${classes.title}`]: {
    marginBottom: theme.spacing(4),
  },
  [`& .${classes.button}`]: {
    padding: theme.spacing(1.5, 4),
    fontSize: '1rem',
  },
}))

const Login: React.FC = () => {
  const handleLoginClick = () => {
    window.location.href = `https://github.com/login/oauth/authorize?client_id=${process.env.CLIENT_ID}`
  }

  return (
    <Root
      container
      className={classes.container}
      justifyContent="center"
      alignItems="center"
    >
      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <div className={classes.content}>
          <Typography variant="h3" className={classes.title}>
            Welcome
          </Typography>
          <Typography variant="body1" color="textSecondary" gutterBottom>
            Sign in to view your GitHub repository statistics
          </Typography>
          <Button
            variant="contained"
            color="primary"
            className={classes.button}
            onClick={handleLoginClick}
            size="large"
          >
            Login with GitHub
          </Button>
        </div>
      </Grid>
    </Root>
  )
}

export default Login
