import React, { Component } from 'react';
import Score from './Score';
import { BrowserRouter as Router, Route, Link } from "react-router-dom";

const YEAR = require('./config/year');
const YEARS = require('./config/years');

const linkStyle = {
  margin: '0 5px'
}

class App extends Component {
  render() {
    return (
	  <Router>
      <div className="App">
        <header className="App-header">
          <h1 className="App-title">Blame Hockey</h1>
		  <nav>
		  	<Link style={linkStyle} to="/">Current Year</Link>
			{ YEARS.map( y => {
				if ( y === YEAR ) {
					return '';
				}
				const yearString = "/y/" + y;
				return <Link to={yearString} key={y} > {y} </Link> 
			}) }
		  </nav>
		  <Route exact path="/" component={Score} />
		  <Route path="/y/:year" component={Score} />
        </header>
      </div>
	  </Router>
    );
  }
}

export default App;
