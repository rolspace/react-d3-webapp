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

	describe('logInUser method', function() {
		afterEach(function() {
			InstagramButton.prototype.logInUser.restore();
		});

		it('should execute the logInUser function on a <button> click', function() {
			const logInUser = sinon.spy(InstagramButton.prototype, 'logInUser');
			const wrapper = mount(<InstagramButton text="text" />);
			wrapper.find('button').simulate('click');

			expect(logInUser.calledOnce).to.equal(true);
		});

		it('should execute the logInUser function on a <button> click and return true', function() {
			const logInUser = sinon.spy(InstagramButton.prototype, 'logInUser');
			const wrapper = mount(<InstagramButton text="text" />);
			wrapper.find('button').simulate('click');

			expect(logInUser).to.have.returned(true);
		});
	})
});