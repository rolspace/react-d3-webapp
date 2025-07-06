import {
  createTheme,
  StyledEngineProvider,
  ThemeProvider,
} from '@mui/material/styles'
import 'core-js/stable'
import React from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import store from './app/store.js'
import App from './components/App.jsx'

const theme = createTheme({
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
    ].join(','),
  },
})

const container = document.getElementById('container')
const root = createRoot(container)

root.render(
  <Provider store={store}>
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={theme}>
        <App />
      </ThemeProvider>
    </StyledEngineProvider>
  </Provider>,
)
