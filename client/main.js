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
			light: '#CFD8DC',
			main: '#455A64',
			dark: '#607D8B',
			contrastText: '#fff',
		},
		secondary: {
			light: '#ff7961',
			main: '#00BCD4',
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