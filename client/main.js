import 'babel-polyfill';
import React from 'react';
import ReactDom from 'react-dom';
import { Provider } from 'react-redux';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import store from './core/store';
import HomePage from './pages/home';
import StartPage from './pages/start';
import Authorization from './containers/Authorization';

const container = document.getElementById('container');

ReactDom.render(
	<Provider store={store}>
		<Router>
			<div>
				<Route exact path="/" component={HomePage} />
				<Route path="/start" component={Authorization(StartPage)} />
			</div>
		</Router>
	</Provider>,
	container
);