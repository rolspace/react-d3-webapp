import 'babel-polyfill';
import React from 'react';
import ReactDom from 'react-dom';
import App from './components/App';

const container = document.getElementById('container');

ReactDom.render(<App />, container);