import React from 'react';
import { expect } from 'chai';
import { shallow } from 'enzyme';
import Home from '../../pages/home';

describe('Home Component', function() {
	it('should be wrapped by a div', function() {
		const wrapper = shallow(<Home />);
		expect(wrapper.find('div')).to.have.length(1);
	});
});