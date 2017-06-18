import React from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import store from '../common/store';
import HomePage from '../pages/home';
import StartPage from '../pages/start';
import PrivateRoute from '../containers/PrivateRoute';

class App extends React.Component {
	render() {
		return (
			<Provider store={store}>
				<Router>
					<div>
						<Switch>
							<Route exact path='/' component={HomePage} />
							<PrivateRoute path='/start' component={StartPage} />
						</Switch>
					</div>
				</Router>
			</Provider>
		)
	}
}

export default App;