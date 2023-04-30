import PropTypes from 'prop-types'
import qs from 'query-string'
import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Route, withRouter } from 'react-router-dom'
import { fetchToken } from './userSlice'

const PrivateRoute = ({ component, location, path }) => {
  const { code, state } = qs.parse(location.search)

  const dispatch = useDispatch()
  const { token } = useSelector((state) => state.user)

  useEffect(() => {
    if (code && state && token === '') {
      dispatch(fetchToken({ code, state }))
    } else if (token === '') {
      window.location.replace(
        `https://github.com/login/oauth/authorize?client_id=${
          process.env.APPLICATION_ID
        }&state=${crypto.randomUUID()}&redirect_uri=${
          window.location.protocol
        }//${window.location.host}${location.pathname}`,
      )
    }
  }, [dispatch, code, state])

  if (token) {
    const Component = component
    history.replaceState({}, document.title, path)

    return <Route exact path={path} component={Component} />
  } else {
    return <div>Loading...</div>
  }
}

PrivateRoute.propTypes = {
  component: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  path: PropTypes.string.isRequired,
}

export default withRouter(PrivateRoute)
