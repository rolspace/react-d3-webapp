import PropTypes from 'prop-types'
import queryString from 'query-string'
import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchToken } from './userSlice.js'

const PrivateRoute = ({ children, path, pathname, search }) => {
  const { code, state } = queryString.parse(search)

  const dispatch = useDispatch()
  const { token } = useSelector((state) => state.user)

  useEffect(() => {
    if (code && state) {
      dispatch(fetchToken({ code, state }))
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
