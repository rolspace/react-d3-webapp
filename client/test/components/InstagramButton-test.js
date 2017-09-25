import React from 'react'
import chai from 'chai'
import { expect } from 'chai'
import { shallow, mount } from 'enzyme'
import sinon from 'sinon'
import sinonChai from 'sinon-chai'
import Button from '../../components/Button'
import InstagramButton from '../../components/InstagramButton'

chai.use(sinonChai)

describe('Components: InstagramButton component', function() {
	it('renders one <Button> Component', function() {
		const wrapper = shallow(<InstagramButton text="text" />)

		expect(wrapper.find(Button)).to.have.length(1)
	})

	it('executes the logInUser function when the click event is fired', function() {
		const logInUserSpy = sinon.spy(InstagramButton.prototype, 'logInUser')
		const wrapper = mount(<InstagramButton text="text" />)

		wrapper.find('button').simulate('click')

		expect(logInUserSpy).to.have.property('callCount', 1)
		//expect(logInUserSpy.calledOnce).to.equal(true)

	logInUserSpy.restore()
	})
})