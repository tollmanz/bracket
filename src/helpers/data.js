const fs = require("fs");
const path = require("path");

const YEAR = require("../config/year");
const CONFIG_PATH = path.join(__dirname, "..", "/config");

const getYearData = (year = YEAR) => {
  const YEAR_PATH = path.join(CONFIG_PATH, `${year}`);

  const picks = fs
    .readFileSync(path.join(YEAR_PATH, "picks.hockey"), "utf8")
    .split("\n");
  const results = fs
    .readFileSync(path.join(YEAR_PATH, "results.hockey"), "utf8")
    .split("\n");

  return {
    picks,
    results,
  };
};

module.exports = {
  YEAR,
  getYearData,
};
