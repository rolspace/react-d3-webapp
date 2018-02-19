import { expect } from 'chai';
import mediaReducer from '../../reducers/media'

describe('Reducers: Media reducer', () => {
  it('returns the initial state if no action is executed', () => {
    expect(mediaReducer(undefined, {})).to.deep.equal({
    	items: [],
    	isComplete: false,
    	isFetching: false,
    	error: null
    })
  })

  it('returns the correct object when the FETCH_MEDIA action is executed', () => {
    expect(mediaReducer(undefined, { type: 'FETCH_MEDIA' })).to.deep.equal({
      items: [],
      isComplete: false,
      isFetching: true,
      error: null
    })
  })

  it('returns the correct object when the FETCH_MEDIA_ERROR action is executed', () => {
    expect(mediaReducer(undefined, { type: 'FETCH_MEDIA_ERROR' })).to.deep.equal({
      items: [],
      isComplete: true,
      isFetching: false,
      error: 'some error'
    })
  })
})