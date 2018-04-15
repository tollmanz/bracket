const { computeCompetitorScore } = require('../helpers/compute');
const data = require('../helpers/data');

const computeResults = () => {
  return data.COMPETITORS.map(competitor => {
    return {
      name: competitor.twitter,
      score: computeCompetitorScore(competitor.twitter, data.CHOICES, data.MATCHUPS)
    };
  });
};

module.exports = {
  computeResults
};
