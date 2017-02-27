import 'babel-polyfill';
import React from 'react';
import ReactDom from 'react-dom';
import { Provider } from 'react-redux';
import { Router, Route, IndexRoute, browserHistory } from 'react-router';
import store from './core/store';
import App from './components/App';
import HomePage from './pages/home';
import StartPage from './pages/start';

const container = document.getElementById('container');

ReactDom.render(
	<Provider store={store}>
		<Router history={browserHistory}>
			<Route path="/" component={App}>
				<IndexRoute component={HomePage}/>
				<Route path="/start" component={StartPage}/>
			</Route>
		</Router>
	</Provider>,
	container
);