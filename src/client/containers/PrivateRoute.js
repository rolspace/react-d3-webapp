import React, { useEffect } from 'react'
import PropTypes from 'prop-types'
import { useDispatch, useSelector } from 'react-redux'
import { withRouter, Route } from 'react-router-dom'
import qs from 'query-string'
import { fetchToken } from '../actions/user'

const PrivateRoute = (props) => {
  const { code, state } = qs.parse(props.location.search)

  const { isLoggedIn } = useSelector(state => state.user)
  const dispatch = useDispatch()

  useEffect(() => {
    if (code && state && !isLoggedIn) {
      dispatch(fetchToken(code, state))
    }
    else if (!isLoggedIn) {
      window.location.replace(`https://github.com/login/oauth/authorize?client_id=${process.env.APPLICATION_ID}&state=blah&redirect_uri=${window.location.protocol}//${window.location.host}${props.location.pathname}`)
    }
  }, [code, state])

  if (isLoggedIn) {
    const Component = props.component
    history.replaceState({}, document.title, props.path)

    return (
        <Route exact path={props.path} component={Component} />
    )
  }
  else {
    return <div>Loading...</div>
  }
}

PrivateRoute.propTypes = {
  component: PropTypes.func.isRequired,
  history: PropTypes.object.isRequired,
  path: PropTypes.string.isRequired,
}

export default withRouter(PrivateRoute)
