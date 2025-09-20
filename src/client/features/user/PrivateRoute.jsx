import PropTypes from 'prop-types'
import queryString from 'query-string'
import React, { useEffect } from 'react'
import { useUserStore } from '../../stores/userStore'

const PrivateRoute = ({ children, path, pathname, search }) => {
  const { code, state } = queryString.parse(search)

  const token = useUserStore((state) => state.token)
  const fetchToken = useUserStore((state) => state.fetchToken)

  useEffect(() => {
    if (code && state) {
      fetchToken({ code, state })
    } else if (token === '') {
      window.location.replace(
        `https://github.com/login/oauth/authorize?client_id=${
          process.env.APPLICATION_ID
        }&state=${crypto.randomUUID()}&redirect_uri=${
          window.location.protocol
        }//${window.location.host}${pathname}`,
      )
    }
  }, [code, state])

  if (token !== '') {
    history.replaceState({}, document.title, path)

    return children
  } else if (token === '') {
    return <div>Requesting access...</div>
  }
}

PrivateRoute.propTypes = {
  children: PropTypes.object,
  path: PropTypes.string.isRequired,
  pathname: PropTypes.string.isRequired,
  search: PropTypes.string.isRequired,
}

export default PrivateRoute
