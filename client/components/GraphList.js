import React from 'react'
import { Link } from 'react-router-dom'

class GraphList extends React.Component {
	render() {
		return (
			<div className="graph-list">
				<ul>
					<li><Link to="/graphs/repo-additions-deletions">Repository Addtions/Deletions</Link></li>
				</ul>
			</div>
		)
	}
}

export default GraphList