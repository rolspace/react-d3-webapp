/* eslint-disable no-unused-vars */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import * as d3 from 'd3';
import { getRecentMedia } from '../actions/media'; 

class RecentMediaGraph extends React.Component {
	constructor(props) {
		super(props);
		
		this.renderChart = this.renderChart.bind(this);
	}

	renderChart() {
		const node = this.node;

		const margins = { top: 20, right: 40, bottom: 20, left: 40 };
		const width = +d3.select(node).attr('width') - margins.right - margins.left;
		const height = +d3.select(node).attr('height') - margins.top - margins.bottom;
		const xDomain = this.props.media.map(media => media.createdTime);

		const x = d3.scaleBand().domain(xDomain).rangeRound([0, width]).padding(0.1);
		const y = d3.scaleLinear().domain([0, d3.max(this.props.media, d => d.likes.count)]).rangeRound([height, 0]);

		const topG = d3.select(node).append('g')
			.attr('transform', 'translate(40, 20)');

		topG.append('g').attr('class', 'axis axis--x')
			.attr('transform', 'translate(0, 460)')
			.call(d3.axisBottom(x));

		topG.append('g').attr('class', 'axis axis--y')
			.call(d3.axisLeft(y).ticks(9));

		topG.selectAll('bar').data(this.props.media)
			.enter().append('rect')
			.style('fill', 'blue')
			.attr('x', d => x(d.createdTime))
			.attr('width', x.bandwidth())
			.attr('y', d => y(d.likes.count))
			.attr('height', d => height - y(d.likes.count));
	}

	componentDidMount() {
		const { dispatch } = this.props;
		dispatch(getRecentMedia(this.props.user.id));
	}

	render() {
		if (typeof this.props.media !== undefined && this.props.media.length > 0) {
			this.renderChart();
		}

		return (
			<div>
				<svg ref={ node => this.node = node} style={{border:'1px solid'}} width={800} height={500}>
				</svg>
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