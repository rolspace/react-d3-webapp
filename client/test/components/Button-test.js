import React from 'react'
import { expect } from 'chai'
import { shallow, mount } from 'enzyme'
import sinon from 'sinon'
import Button from '../../components/Button'

describe('Components: Button component', () => {
	it('renders one <button> element', function() {
		const onClickSpy = sinon.spy();
		const wrapper = mount(<Button text="text" click={onClickSpy} />)
		
		expect(wrapper.find('button')).to.have.length(1)
	});

	it('executes the function passed in the "click" prop when the click event is fired', () => {
		const onClickSpy = sinon.spy();
		const wrapper = mount(<Button text="text" click={onClickSpy} />)

		wrapper.find('button').simulate('click')
		expect(onClickSpy.calledOnce).to.equal(true)
	});
});