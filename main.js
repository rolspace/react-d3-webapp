import 'babel-polyfill';

import React from 'react';
import ReactDom from 'react-dom';
import { Provider } from 'react-redux';
import { Router, Route, IndexRoute, hashHistory } from 'react-router';
import Register from './pages/register';

import store from './core/store';
import App from './components/App';
import HomePage from './pages/home';

const container = document.getElementById('container');

ReactDom.render(
	<Provider store={store}>
		<Router history={hashHistory}>
			<Route path="/" component={App}>
				<Route path="register" component={Register}/>
				<IndexRoute component={HomePage}/>
			</Route>
		</Router>
	</Provider>,
	container
);