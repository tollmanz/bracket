const YEAR = require('../config/year');
const CHOICES = require(`../config/${YEAR}/choices.json`);
const COMPETITORS = require(`../config/${YEAR}/competitors.json`);
const MATCHUPS = require(`../config/${YEAR}/matchups.json`);
const TEAMS = require(`../config/${YEAR}/teams.json`);
const GET_YEAR_DATA = ( y = YEAR ) => {
	return {
		CHOICES : require(`../config/${y}/choices.json`),
		COMPETITORS : require(`../config/${y}/competitors.json`),
		MATCHUPS : require(`../config/${y}/matchups.json`),
		TEAMS : require(`../config/${y}/teams.json`),
	}
}

module.exports = {
  CHOICES,
  COMPETITORS,
  MATCHUPS,
  TEAMS,
  YEAR,
  GET_YEAR_DATA
}
