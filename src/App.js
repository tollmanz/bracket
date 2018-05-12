import React, { Component } from 'react';

const { computeResults } = require('./actions/compute');
const _ = require('lodash');

const results = _.reverse(_.sortBy(computeResults(), 'score'));

class App extends Component {
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <h1 className="App-title">Hockey</h1>
        </header>
        <p className="App-intro">
			{results.map ( ( r, i ) => {
				return <p> {i + 1} {r.name} {r.score} </p> 
			})}
        </p>
      </div>
    );
  }
}

export default App;
