import {
  // createAction,
  createAsyncThunk,
  // createReducer,
  createSlice,
} from '@reduxjs/toolkit'
import { createHighRange, createLowRange } from '../../lib/range'

const initialState = {
  owner: 'facebook',
  name: 'react',
  commits: {
    changedFiles: [],
    linesAdded: [],
    linesDeleted: [],
  },
  loading: 'idle',
  fulfilled: false,
  error: null,
}

export const repoSlice = createSlice({
  name: 'repo',
  initialState,
  reducers: {
    repoChanged(state, action) {
      const {
        payload: { valueOwnerInput, valueNameInput },
      } = action
      state.owner = valueOwnerInput
      state.name = valueNameInput
      state.fulfilled = false
      state.commits = {
        changedFiles: [],
        linesAdded: [],
        linesDeleted: [],
      }
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchRepo.pending, (state) => {
      state.loading = 'pending'
      state.fulfilled = false
      state.error = null
      state.commits = {
        changedFiles: [],
        linesAdded: [],
        linesDeleted: [],
      }
    })
    builder.addCase(fetchRepo.fulfilled, (state, action) => {
      const {
        payload: { data },
      } = action

      state.loading = 'idle'
      state.fulfilled = true
      state.error = null
      state.commits = {
        changedFiles: createLowRange(data, 'changedFiles'),
        linesAdded: createHighRange(data, 'additions'),
        linesDeleted: createHighRange(data, 'deletions'),
      }
    })
    builder.addCase(fetchRepo.rejected, (state, action) => {
      const { error } = action

      state.loading = 'idle'
      state.error = error
      state.commits = {
        changedFiles: [],
        linesAdded: [],
        linesDeleted: [],
      }
    })
  },
})

export const fetchRepo = createAsyncThunk(
  'repo/fetch',
  async ({ owner, name, token }) => {
    const response = await fetch(
      `${process.env.SERVER_URL}/api/repo/${owner}/${name}/`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
        }),
      },
    )

    return await response.json()
  },
)

export const {
  actions: { repoChanged },
} = repoSlice

export default repoSlice.reducer
