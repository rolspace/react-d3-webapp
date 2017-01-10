import React from 'react';
import { expect } from 'chai';
import { shallow, mount } from 'enzyme';
import sinon from 'sinon';
import Button from '../../components/Button';

describe('Button component', function(){
	it('should render a <button> element', function() {
		const wrapper = shallow(<Button text="text" />);
		expect(wrapper.find('button')).to.have.length(1);
	});

	it('should execute a function for the onClick event', function() {
		const onButtonClick = sinon.spy();
		const wrapper = mount(<Button text="text" onClick={onButtonClick} />);

		wrapper.find('button').simulate('click');
		expect(onButtonClick.calledOnce).to.equal(true);
	});
});