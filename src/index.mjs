import React from 'react';
import ReactDOM from 'react-dom';
import App from './App.mjs';
import { unregister } from './registerServiceWorker.mjs';

ReactDOM.render(<App />, document.getElementById('root'));
unregister();
