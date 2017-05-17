import React from 'react';
import { expect } from 'chai';
import { shallow } from 'enzyme';
import HomePage from '../../pages/home';
import InstagramButton from '../../components/InstagramButton';

describe('HomePage Component', function() {
	it('should be wrapped by one <div> element', function() {
		const wrapper = shallow(<HomePage />);
		expect(wrapper.find('div')).to.have.length(1);
	});

	it('should render one <InstagramButton> Component', function() {
		const wrapper = shallow(<HomePage />);
		expect(wrapper.find(InstagramButton)).to.have.length(1);
	});
});