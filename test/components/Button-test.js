import React from 'react';
import { expect } from 'chai';
import { shallow } from 'enzyme';
import Button from '../../components/Button';

describe('Button component', function(){
	it('should render a <button> element', function() {
		const wrapper = shallow(<Button text="text" />);
		expect(wrapper.find('button')).to.have.length(1);
	});
});