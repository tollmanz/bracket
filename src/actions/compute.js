const { computeCompetitorScore } = require('../helpers/compute');
const data = require('../helpers/data');
const YEAR = require('../config/year');

const computeResults = ( year = YEAR ) => {
  const yearData = data.GET_YEAR_DATA( year );
  return yearData.COMPETITORS.map(competitor => {
    return {
      name: competitor.twitter,
      score: computeCompetitorScore(competitor.twitter, yearData.CHOICES, yearData.MATCHUPS)
    };
  });
};

module.exports = {
  computeResults
};
