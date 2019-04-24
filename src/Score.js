import React, { Component } from 'react';

const YEAR = require('./config/year');

const { computeResults } = require('./actions/compute');
const _ = require('lodash');

class Score extends Component {
	
  render() {
	  const y = this.props.match.params.year || YEAR;
	const results = _.reverse(_.sortBy(computeResults( y ), 'score'));
    return (
      <ol className="App-intro">
        {results.map ( ( r, i ) => {
          return <li key={ "result-" + i } > {r.name} {r.score} </li>
        })}
      </ol>
    );
  }
}

export default Score;
