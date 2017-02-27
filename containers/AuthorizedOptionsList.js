import { connect } from 'react-redux';
import Options from '../components/Options';

const mapStateToProps = (state) => {
	//Retrieve code from query string and
	//request token from Instagram.

	//Create an "authorized" property to add to the state.
	//The token should be stored in the DB
	
	//console.log(ownProps.params.code);

	return {
		authorized: state.authorized
	};
}

const AuthorizedOptionsList = connect(mapStateToProps)(Options);

export default AuthorizedOptionsList;