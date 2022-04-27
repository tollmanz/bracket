const YEAR = require("../config/year");

const getYearData = (year = YEAR) => {
  const picks = require(`../config/${year}/picks.hockey.js`).split("\n");
  const results = require(`../config/${year}/results.hockey.js`).split("\n");

  return {
    picks,
    results,
  };
};

module.exports = {
  YEAR,
  getYearData,
};
