import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import {MagicCache} from 'magic-cache';

MagicCache.init({
    url: '/sw.js'
});

ReactDOM.render(<App />, document.getElementById('root'));
