import React from 'react'
import { Route } from 'react-router-dom'
import RecentMedia from '../../containers/RecentMedia'
import GraphList from '../../components/GraphList'
import BarGraph from '../../components/BarGraph'

class StartPage extends React.Component {
	render() {
		return (
			<div className="startpage">
				This is the Start Page!
				<GraphList />
				<Route path="/start/likes" component={RecentMedia(BarGraph, 'createdTime', 'likes.count')} />
				<Route path="/start/comments" component={RecentMedia(BarGraph, 'createdTime', 'comments.count')} />
			</div>
		)
	}
}

export default StartPage