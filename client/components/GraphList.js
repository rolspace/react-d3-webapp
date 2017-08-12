import React from 'react'
import { Link } from 'react-router-dom'

class GraphList extends React.Component {
	render() {
		return (
			<div className="graph-list">
				<Link to="/start/likes">Recent Likes</Link>
				<Link to="/start/comments">Recent Comments</Link>
			</div>
		)
	}
}

export default GraphList