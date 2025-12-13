import queryString from 'query-string'
import React, { useEffect, ReactNode } from 'react'
import { useUserStore } from '../../stores/userStore'

interface PrivateRouteProps {
  children: ReactNode
  path: string
  pathname: string
  search: string
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children, path, pathname, search }) => {
  const { code, state } = queryString.parse(search)

  const token = useUserStore((state) => state.token)
  const fetchToken = useUserStore((state) => state.fetchToken)

  useEffect(() => {
    if (code && state && token === '') {
      fetchToken({ code: code as string, state: state as string })
    } else if (token === '') {
      window.location.replace(
        `https://github.com/login/oauth/authorize?client_id=${
          process.env.APPLICATION_ID
        }&state=${crypto.randomUUID()}&redirect_uri=${
          window.location.protocol
        }//${window.location.host}${pathname}`,
      )
    }
  }, [code, state, token])

  if (token !== '') {
    history.replaceState({}, document.title, path)

    return <>{children}</>
  } else if (token === '') {
    return <div>Requesting access...</div>
  }
}

export default PrivateRoute
