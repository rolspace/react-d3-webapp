import 'babel-polyfill';

import React from 'react';
import ReactDom from 'react-dom';
import { Provider } from 'react-redux';
import { Router, Route, hashHistory } from 'react-router';
import Home from './pages/home';
import Register from './pages/register';

import store from './core/store';

const container = document.getElementById('container');

ReactDom.render(
	<Provider store={store}>
		<Router history={hashHistory}>
			<Route path="/" component={Home}>
				<Route path="/register" component={Register} />
			</Route>
		</Router>
	</Provider>,
	container
);