/* eslint-disable react/prop-types */
import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchRepo } from '../actions/repo'
import { changeScreen } from '../actions/ui'

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

export default RepoCommits
