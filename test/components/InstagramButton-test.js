import React from 'react';
import { expect } from 'chai';
import { mount } from 'enzyme';
import InstagramButton from '../../components/InstagramButton';

describe('InstagramButton component', function(){
	it('should render a <button> element', function() {
		const wrapper = mount(<InstagramButton text="text" />);
		expect(wrapper.find('button')).to.have.length(1);
	});

	/*it('should execute the logInUser function on a button click', function(){
		const wrapper = shallow(<Button text="text" )
	});*/
});