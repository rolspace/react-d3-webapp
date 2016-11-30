import 'babel-polyfill';

import React from 'react';
import ReactDom from 'react-dom';
import { Provider } from 'react-redux';
import Home from './pages/home';

import store from './core/store';

const container = document.getElementById('container');
ReactDom.render(
	<Provider store={store}>
		<Home />
	</Provider>,
	container
);