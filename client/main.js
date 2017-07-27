import 'babel-polyfill'
import React from 'react'
import { Provider } from 'react-redux'
import { render } from 'react-dom'
import store from './common/store'
import App from './components/App'

const container = document.getElementById('container')

render(
	<Provider store={store}>
    <App />
  </Provider>, container
)