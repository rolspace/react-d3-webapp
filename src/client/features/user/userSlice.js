/* eslint-disable camelcase */
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

const initialState = {
  token: '',
  error: null,
}

export const userSlice = createSlice({
  name: 'token',
  initialState,
  extraReducers: (builder) => {
    builder.addCase(fetchToken.pending, (state) => {
      state.token = ''
      state.error = null
    })
    builder.addCase(fetchToken.fulfilled, (state, action) => {
      const {
        payload: { access_token },
      } = action

      state.token = access_token
      state.error = null
    })
    builder.addCase(fetchToken.rejected, (state, action) => {
      const { payload } = action

      state.token = ''
      state.error = payload
    })
  },
})

export const fetchToken = createAsyncThunk(
  'token/fetch',
  async ({ code, state }) => {
    const response = await fetch(`${process.env.SERVER_URL}/api/token/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code,
        state,
      }),
    })

    return await response.json()
  },
)

export default userSlice.reducer
