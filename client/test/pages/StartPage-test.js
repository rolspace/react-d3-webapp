import React from 'react';
import { expect } from 'chai';
import { shallow } from 'enzyme';
import StartPage from '../../pages/start';

describe('StartPage Component', function() {
	it('should render one <div> element', function() {
		const wrapper = shallow(<StartPage />);
		expect(wrapper.find('div')).to.have.length(1);
	});
});