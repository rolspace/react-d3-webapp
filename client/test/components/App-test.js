import React from 'react';
import { expect } from 'chai';
import { shallow } from 'enzyme';
import App from '../../components/App';

describe('App Component', function() {
	it('should be wrapped by one <div> element', function() {
		const wrapper = shallow(<App>App Component</App>);
		expect(wrapper.find('div')).to.have.length(1);
	});

	it('should have a "children" property', function() {
		const wrapper = shallow(<App><span>child1</span><span>child2</span></App>);
		expect(wrapper.find('span')).to.have.length(2);
	});
});