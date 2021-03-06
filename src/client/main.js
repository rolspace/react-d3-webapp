import 'core-js/stable'
import 'regenerator-runtime/runtime'
import React from 'react'
import { Provider } from 'react-redux'
import { render } from 'react-dom'
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles'
import store from './common/store'
import App from './components/App'

const theme = createMuiTheme({
	palette: {
		primary: {
			light: '#718792',
			main: '#455a64',
			dark: '#1c313a',
			contrastText: '#fff',
		},
		secondary: {
			light: '#62efff',
			main: '#00bcd4',
			dark: '#008ba3',
			contrastText: '#000',
		},
	},
	typography: {
		fontFamily: [
			'-apple-system',
			'BlinkMacSystemFont',
			'"Segoe UI"',
			'Roboto',
			'"Helvetica Neue"',
			'Arial',
			'sans-serif',
			'"Apple Color Emoji"',
			'"Segoe UI Emoji"',
			'"Segoe UI Symbol"',
		].join(',')
	}
})

const container = document.getElementById('container')

render(
	<Provider store={store}>
    <MuiThemeProvider theme={theme}>
      <App />
    </MuiThemeProvider>
	</Provider>, container
)
