import React from 'react';
import chai from 'chai';
import { expect } from 'chai';
import { mount } from 'enzyme';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import InstagramButton from '../../components/InstagramButton';

chai.use(sinonChai);

describe('InstagramButton component', function() {
	it('should render one <button> element', function() {
		const wrapper = mount(<InstagramButton text="text" />);
		
		expect(wrapper.find('button')).to.have.length(1);
	});

	it('should call the logInUser function, when the click event is fired', function() {
		const logInUser = sinon.spy(InstagramButton.prototype, 'logInUser');
		const wrapper = mount(<InstagramButton text="text" />);
		wrapper.find('button').simulate('click');

		expect(logInUser.calledOnce).to.equal(true);

		logInUser.restore();
	});
});