/* eslint-disable react/prop-types */
import React, { useEffect } from 'react'
//import PropTypes from 'prop-types'
import { useDispatch, useSelector } from 'react-redux'
import { changeScreen } from '../actions/ui'
import { fetchRepo } from '../actions/repo'

const RepoCommits = ({ graphComponent, options }) => {
	const dispatch = useDispatch()

	const screen = useSelector((state) => state.ui.screen)
	const repo = useSelector((state) => state.repo)
	const user = useSelector((state) => state.user)

	useEffect(() => {
		dispatch(changeScreen({ screen: graphComponent.name }))

		return () => {
			dispatch(changeScreen({ screen: '' }))
		}
	}, [dispatch, screen])

	const { error, isFetching, isComplete, name, owner } = repo
	useEffect(() => {
		const { isLoggedIn, token } = user


		if (!isFetching && !isComplete && isLoggedIn) {
			dispatch(fetchRepo(owner, name, token))
		}
	}, [dispatch, repo, user])

	const isLoading = isFetching && !isComplete
	const GraphComponent = graphComponent

	return (
		<GraphComponent data={repo.commits} error={error} isLoading={isLoading} {...options} />
	)
}

/* class RepoCommits extends React.Component {
	constructor(props) {
		super(props)
	}

	shouldComponentUpdate(nextProps) {
		if (!_.isEqual(this.props.repo, nextProps.repo)) {
			return true
		}

		if (this.props.screen !== nextProps.screen) {
			return true
		}

		return false
	}

	componentDidUpdate() {
		const { dispatch, repo, user } = this.props
		const { token } = user

		if (!repo.isFetching && !repo.isComplete && user.isLoggedIn) {
			const { owner, name } = repo

			dispatch(fetchRepo(owner, name, token))
		}
	}

	componentDidMount() {
		const { dispatch, repo, user } = this.props
		const { token } = user

		if (!repo.isFetching && !repo.isComplete && user.isLoggedIn) {
			const owner = repo.owner || 'facebook'
			const name = repo.name || 'react'

			dispatch(fetchRepo(owner, name, token))
		}

		dispatch(changeScreen({ screen: this.props.graphComponent.name }))
	}

	componentWillUnmount() {
		const { dispatch } = this.props
		dispatch(changeScreen({ screen: '' }))
	}

	render() {
		const GraphComponent = this.props.graphComponent

		const error = this.props.repo.error
		const isLoading = this.props.repo.isFetching && !this.props.repo.isComplete

		return <GraphComponent data={this.props.repo.commits} error={error} isLoading={isLoading} {...this.props.options} />
	}
} */

/* RepoCommits.propTypes = {
	screen: PropTypes.string.isRequired,
	dispatch: PropTypes.func.isRequired,
	repo: PropTypes.object.isRequired,
	user: PropTypes.object.isRequired
} */

/* const mapStateToProps = (state) => {
	return {
		screen: state.ui.screen,
		user: state.user,
		repo: state.repo,
	}
} */

// export default connect(mapStateToProps)(RepoCommits)
export default RepoCommits
