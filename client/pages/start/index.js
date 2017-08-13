import React from 'react'
import { Route } from 'react-router-dom'
import RecentMedia from '../../containers/RecentMedia'
import LikesGraph from '../../components/LikesGraph'
import CommentsGraph from '../../components/CommentsGraph'
import GraphList from '../../components/GraphList'

class StartPage extends React.Component {
	render() {
		return (
			<div className="startpage">
				This is the Start Page!
				<GraphList />
				<Route path="/start/likes" component={RecentMedia(LikesGraph)} />
				<Route path="/start/comments" component={RecentMedia(CommentsGraph)} />
			</div>
		)
	}
}

export default StartPage