const { compute } = require("../helpers/compute");
const { getYearData, YEAR } = require("../helpers/data");

const computeResults = (year = YEAR) => {
  const yearData = getYearData(year);

  const results = compute(yearData.picks, yearData.results);

  return Object.keys(results).map((key) => ({
    name: key,
    score: results[key],
  }));
};

module.exports = {
  computeResults,
};
