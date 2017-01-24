import React from 'react';
import { expect } from 'chai';
import { shallow } from 'enzyme';
import HomePage from '../../pages/home';
import Button from '../../components/Button';

describe('HomePage Component', function() {
	it ('should render one <Button> Component', function() {
		const wrapper = shallow(<HomePage />);
		expect(wrapper.find(Button)).to.have.length(1);
	});
});