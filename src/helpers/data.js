const YEAR = require('../config/year');
const CHOICES = require(`../config/${YEAR}/choices.json`);
const COMPETITORS = require(`../config/${YEAR}/competitors.json`);
const MATCHUPS = require(`../config/${YEAR}/matchups.json`);
const TEAMS = require(`../config/${YEAR}/teams.json`);
const GET_YEAR_DATA = ( y = YEAR ) => {
	return {
		CHOICES : require(`../config/${YEAR}/choices.json`),
		COMPETITORS : require(`../config/${YEAR}/competitors.json`),
		MATCHUPS : require(`../config/${YEAR}/matchups.json`),
		TEAMS : require(`../config/${YEAR}/teams.json`),
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
