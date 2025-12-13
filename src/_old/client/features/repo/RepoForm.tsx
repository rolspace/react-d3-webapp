import Button from '@mui/material/Button'
import { styled } from '@mui/material/styles'
import Grid from '@mui/material/Grid'
import TextField from '@mui/material/TextField'
import React, { useState } from 'react'
import { useRepoStore } from '../../stores/repoStore'
import { useUserStore } from '../../stores/userStore'

const PREFIX = 'RepoForm'

const classes = {
  container: `${PREFIX}-container`,
  buttonContainer: `${PREFIX}-buttonContainer`
}

const Root = styled('form')({
  [`& .${classes.container}`]: {
    paddingTop: '60px',
  },
  [`& .${classes.buttonContainer}`]: {
    lineHeight: '72px',
    textAlign: 'center',
  },
})

const RepoForm: React.FC = () => {
  const owner = useRepoStore((state) => state.owner)
  const repository = useRepoStore((state) => state.repository)
  const error = useRepoStore((state) => state.error)
  const token = useUserStore((state) => state.token)
  const setRepo = useRepoStore((state) => state.setRepo)

  const [ownerValue, setOwnerValue] = useState(owner)
  const [ownerValueChanged, setOwnerValueChanged] = useState(false)

  const [repositoryValue, setRepositoryValue] = useState(repository)
  const [repositoryValueChanged, setRepositoryValueChanged] = useState(false)

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (token !== '') {
      setRepo({ owner: ownerValue, repository: repositoryValue })
    }

    setOwnerValueChanged(false)
    setRepositoryValueChanged(false)
  }

  return (
    <Root onSubmit={handleSubmit}>
      <Grid container className={classes.container}>
        <Grid size={{ xs: 4, sm: 5 }}>
          <TextField
            id="owner"
            name="owner"
            label="owner"
            margin="normal"
            fullWidth
            value={ownerValue}
            onChange={(event) => {
              const {
                target: { value: newValue },
              } = event

              setOwnerValueChanged(owner !== newValue)
              setOwnerValue(newValue)
            }}
          />
        </Grid>
        <Grid size={1} />
        <Grid size={{ xs: 4, sm: 5 }}>
          <TextField
            id="repository"
            name="repository"
            label="repository"
            margin="normal"
            fullWidth
            value={repositoryValue}
            onChange={(event) => {
              const {
                target: { value: newValue },
              } = event

              setRepositoryValueChanged(repository !== newValue)
              setRepositoryValue(newValue)
            }}
          />
        </Grid>
        <Grid size={{ xs: 3, sm: 1 }} className={classes.buttonContainer}>
          <Button
            size="small"
            variant="contained"
            type="submit"
            disabled={
              error === null && !(ownerValueChanged || repositoryValueChanged)
            }
          >
            go
          </Button>
        </Grid>
      </Grid>
    </Root>
  )
}

export default RepoForm
