import 'babel-polyfill';

import React from 'react';
import ReactDom from 'react-dom';
import { Provider } from 'react-redux';
import { Router, Route, IndexRoute, hashHistory } from 'react-router';
import App from './pages/App';
import Home from './pages/home';
import Register from './pages/register';

import store from './core/store';

const container = document.getElementById('container');

ReactDom.render(
	<Provider store={store}>
		<Router history={hashHistory}>
			<Route path="/" component={App}>
				<IndexRoute component={Home}/>
				<Route path="register" component={Register}/>
			</Route>
		</Router>
	</Provider>,
	container
);