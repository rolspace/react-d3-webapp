/* eslint-disable react/prop-types */
import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchRepo } from './repoSlice'

const RepoCommits = ({ graphComponent, options }) => {
  const dispatch = useDispatch()

  const { commits, error, fulfilled, loading, name, owner } = useSelector(
    (state) => state.repo,
  )
  const { token } = useSelector((state) => state.user)

  useEffect(() => {
    if (loading === 'idle' && !fulfilled && error === null && token !== '') {
      dispatch(fetchRepo({ owner, name, commits, token }))
    }

    console.log(`${owner}-${name}-${token}`)
  }, [dispatch, name, owner, token])

  const GraphComponent = graphComponent

  return (
    <GraphComponent
      datasource={commits}
      loading={loading}
      error={error}
      {...options}
    />
  )
}

export default RepoCommits
