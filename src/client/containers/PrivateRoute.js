import PropTypes from 'prop-types'
import qs from 'query-string'
import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Route, withRouter } from 'react-router-dom'
import { fetchToken } from '../actions/user'

const PrivateRoute = ({ component, location, path }) => {
  const { code, state } = qs.parse(location.search)
  const { isLoggedIn } = useSelector((state) => state.user)
  const dispatch = useDispatch()

  useEffect(() => {
    if (code && state && !isLoggedIn) {
      dispatch(fetchToken(code, state))
    } else if (!isLoggedIn) {
      window.location.replace(
        `https://github.com/login/oauth/authorize?client_id=${process.env.APPLICATION_ID}&state=blah&redirect_uri=${window.location.protocol}//${window.location.host}${location.pathname}`,
      )
    }
  }, [code, state])

  if (isLoggedIn) {
    const Component = component
    history.replaceState({}, document.title, path)

    return <Route exact path={path} component={Component} />
  } else {
    return <div>Loading...</div>
  }
}

PrivateRoute.propTypes = {
  component: PropTypes.func.isRequired,
  history: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  path: PropTypes.string.isRequired,
}

export default withRouter(PrivateRoute)
