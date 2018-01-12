import React from 'react'
import { Route } from 'react-router-dom'
import chai from 'chai'
import { expect } from 'chai'
import { shallow, mount } from 'enzyme'
import sinon from 'sinon'
import sinonChai from 'sinon-chai'
import StartPage from '../../pages/start'
import PrivatePage from '../../components/PrivatePage'

describe('Components: PrivatePage component', () => {
  it('renders one <div> element when the user.error prop is not null', () => {
    const user = {
      error: {
        message: 'An error happened'
      },
      isComplete: true
    }

    const wrapper = shallow(<PrivatePage component={ StartPage } user={ user } />)

    expect(wrapper.find('div')).to.have.length(1)
  })

  it('renders one <div> element when the user.isFetching prop is true', () => {
    const user = {
      isFetching: true
    }

    const wrapper = shallow(<PrivatePage component={ StartPage } user={ user } />)

    expect(wrapper.find('div')).to.have.length(1)
  })

  it('renders a Route Component when the user.isLoggedIn prop is true', () => {
    const user = {
      isComplete: true,
      isLoggedIn: true
    }

    const wrapper = shallow(<PrivatePage component={ StartPage } user={ user } />)

    expect(wrapper.find(Route)).to.have.length(1)
  })

  it('renders a Route Component when the user.isLoggedIn prop is false', () => {
    const user = {
      isComplete: true,
      isLoggedIn: false
    }

    const wrapper = shallow(<PrivatePage component={ StartPage } user={ user } />)

    expect(wrapper.find(Route)).to.have.length(1)
  })
})