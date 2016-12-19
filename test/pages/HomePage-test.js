import React from 'react';
import { expect } from 'chai';
import { shallow } from 'enzyme';
import HomePage from '../../pages/home';

describe('HomePage Component', function() {
	it('should be wrapped by a div', function() {
		const wrapper = shallow(<HomePage />);
		expect(wrapper.find('div')).to.have.length(1);
	});
});