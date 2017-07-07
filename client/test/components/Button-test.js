import React from 'react';
import { expect } from 'chai';
import { shallow, mount } from 'enzyme';
import sinon from 'sinon';
import Button from '../../components/Button';

describe('Button component', function(){
	it('should render one <button> element', function() {
		const wrapper = shallow(<Button text="text" />);
		expect(wrapper.find('button')).to.have.length(1);
	});

	it('should call the function passed in as a prop, when the click event is fired', function() {
		const onClick = sinon.spy();
		const wrapper = mount(<Button text="text" click={onClick} />);

		wrapper.find('button').simulate('click');
		expect(onClick.calledOnce).to.equal(true);
	});
});