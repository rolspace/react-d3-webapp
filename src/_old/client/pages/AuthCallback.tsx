import CircularProgress from '@mui/material/CircularProgress'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import { styled } from '@mui/material/styles'
import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

const PREFIX = 'AuthCallback'

const classes = {
  container: `${PREFIX}-container`,
  content: `${PREFIX}-content`,
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
}))

const AuthCallback: React.FC = () => {
  const [searchParams] = useSearchParams()
  const [error, setError] = useState<string | null>(null)
  const code = searchParams.get('code')

  useEffect(() => {
    if (code) {
        
    }


    if (!code) {
      setError('No authorization code received')
      return
    }

    // TODO: Exchange code for access token
    console.log('Authorization code:', code)
  }, [code])

  return (
    <Root
      container
      className={classes.container}
      justifyContent="center"
      alignItems="center"
    >
      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <div className={classes.content}>
          {error ? (
            <>
              <Typography variant="h5" color="error" gutterBottom>
                Authentication Error
              </Typography>
              <Typography variant="body1" color="textSecondary">
                {error}
              </Typography>
            </>
          ) : (
            <>
              <CircularProgress size={60} />
              <Typography variant="h6" sx={{ mt: 3 }}>
                Completing authentication...
              </Typography>
            </>
          )}
        </div>
      </Grid>
    </Root>
  )
}

export default AuthCallback
