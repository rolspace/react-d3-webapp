import React from 'react';
import { connect } from 'react-redux';
import { expect } from 'chai';
import { render } from 'enzyme';
import App from '../../components/App';

describe('App Component', function() {
	it('should be wrapped by one <div> element', function() {
		const wrapper = render(<App>App Component</App>);
		expect(wrapper.find('div')).to.have.length(1);
	});

	/*it('should have a "children" property', function() {
		const wrapper = shallow(<App>App Component</App>);
		expect(wrapper.find('div')).to.have.length(1);
	});*/
});