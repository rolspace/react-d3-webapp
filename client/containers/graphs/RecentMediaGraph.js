import React from 'react';
import { PropTypes } from 'prop-types';
import { connect } from 'react-redux';
import { getRecentMedia } from '../../actions/media'; 

class RecentMediaGraph extends React.Component {
	componentDidMount() {
		const { dispatch } = this.props;

		dispatch(getRecentMedia(this.props.user.id));
	}

	render() {
		const items = this.props.media.map((item, index) => { return <div key={index}>{item.likes.count}</div> });
		
		return (	
			<div>
				{items}
			</div>
		)
	}
}

RecentMediaGraph.propTypes = {
	dispatch: PropTypes.func.isRequired,
	media: PropTypes.array,
	user: PropTypes.object
}

const mapStateToProps = (state) => {
	return {
		user: state.user,
		media: state.recentMedia.data
	}
}

export default connect(mapStateToProps)(RecentMediaGraph);