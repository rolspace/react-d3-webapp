import React from 'react';
import { expect } from 'chai';
import { shallow } from 'enzyme';
import App from '../../components/App';

describe('App Component', function() {
	it('should be wrapped by a <div> element', function() {
		const wrapper = shallow(<App children="children" />);
		expect(wrapper.find('div')).to.have.length(1);
	});
});