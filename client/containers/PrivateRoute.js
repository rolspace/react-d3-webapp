/*eslint-disable no-console*/

import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { withRouter, Route } from 'react-router-dom'
import qs from 'query-string'
import { fetchToken } from '../actions/user'

class PrivateRoute extends React.Component {
  constructor(props) {
    super(props)
  }

  componentDidMount() {
    const { code, state } = qs.parse(this.props.location.search)
    const { isLoggedIn } = this.props.user

    if (code && state && !isLoggedIn) {
      const { dispatch } = this.props
      dispatch(fetchToken(code, state))
    }
    else if (!code && !state && !isLoggedIn) {
      console.log(`${window.location.protocol}//${window.location.host}${this.props.location.pathname}`)
      window.location.replace(`https://github.com/login/oauth/authorize?client_id=5757b639c3b7cf82d4ca&state=blah&redirect_uri=${window.location.protocol}//${window.location.host}${this.props.location.pathname}`)
    }
  }

  render() {
    const { isLoggedIn } = this.props.user

    if (isLoggedIn) {
      const Component = this.props.component
      return <Route path={this.props.path} component={Component} />
    }
    else {
      return <div>Loading...</div>
    }
  }
}

PrivateRoute.propTypes = {
  component: PropTypes.func.isRequired,
  dispatch: PropTypes.func.isRequired,
  history: PropTypes.object.isRequired,
  path: PropTypes.string.isRequired,
  user: PropTypes.object.isRequired
}

const mapStateToProps = (state) => {
  return {
    user: state.user
  }
}

export default withRouter(connect(mapStateToProps)(PrivateRoute))