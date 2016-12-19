import React from 'react';
import { expect } from 'chai';
import { shallow } from 'enzyme';
import App from '../../components/App';

describe('App Component', function() {
	it('should be wrapped by a div', function() {
		const wrapper = shallow(<App />);
		expect(wrapper.find('div')).to.have.length(1);
	});
});