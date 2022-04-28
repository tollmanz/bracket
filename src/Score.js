import React, { Component } from "react";

import YEAR from "./config/year.mjs";

import { computeResults } from "./actions/compute.mjs";
import _ from "lodash";

class Score extends Component {
  render() {
    const y = this.props.match.params.year || YEAR;
    const results = _.reverse(_.sortBy(computeResults(y), "score"));
    return (
      <ol className="App-intro">
        {results.map((r, i) => {
          return (
            <li key={"result-" + i}>
              {" "}
              {r.name} {r.score}{" "}
            </li>
          );
        })}
      </ol>
    );
  }
}

export default Score;
