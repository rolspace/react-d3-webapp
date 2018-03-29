import 'babel-polyfill'
import React from 'react'
import { Provider } from 'react-redux'
import { render } from 'react-dom'
import { MuiThemeProvider, createMuiTheme } from 'material-ui/styles'
import store from './common/store'
import App from './components/App'

const theme = createMuiTheme({
	palette: {
		primary: {
			light: '#ff6659',
			main: '#d32f2f',
			dark: '#9a0007',
			contrastText: '#fff',
		},
		secondary: {
			light: '#ff7961',
			main: '#f44336',
			dark: '#ba000d',
			contrastText: '#000',
		},
	},
})

const container = document.getElementById('container')

render(
	<Provider store={store}>
		<MuiThemeProvider theme={theme}>
			<App />
		</MuiThemeProvider>
	</Provider>, container
)