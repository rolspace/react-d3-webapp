import CircularProgress from '@mui/material/CircularProgress'
import React, { ReactNode, useEffect, useState } from 'react'

type AuthStatus = 'pending' | 'authenticated' | 'unauthenticated'

interface RequireAuthProps {
  children: ReactNode
}

// Gates children on the server session established by the OAuth callback.
const RequireAuth: React.FC<RequireAuthProps> = ({ children }) => {
  const [status, setStatus] = useState<AuthStatus>('pending')

  useEffect(() => {
    const controller = new AbortController()

    fetch(`${process.env.API_URL ?? ''}/api/user/me`, {
      credentials: 'include',
      signal: controller.signal,
    })
      .then((res) => {
        if (res.ok) {
          setStatus('authenticated')
        } else {
          setStatus('unauthenticated')
          window.location.replace('/login')
        }
      })
      .catch((e) => {
        if (e.name !== 'AbortError') {
          setStatus('unauthenticated')
          window.location.replace('/login')
        }
      })

    return () => controller.abort()
  }, [])

  return status === 'authenticated' ? <>{children}</> : <CircularProgress />
}

export default RequireAuth
