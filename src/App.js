import React, { Component } from 'react';

const { computeResults } = require('./actions/compute');
const _ = require('lodash');

const results = _.reverse(_.sortBy(computeResults(), 'score'));

class App extends Component {
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <h1 className="App-title">Blame Hockey</h1>
        </header>
        <ol className="App-intro">
          {results.map ( ( r, i ) => {
            return <li key={ "result-" + i } > {r.name} {r.score} </li>
          })}
        </ol>
      </div>
    );
  }
}

export default App;
