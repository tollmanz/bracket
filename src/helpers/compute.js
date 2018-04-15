const _ = require('lodash');

const data = require('./data');

const POINTS_FOR_PICK = 1;
const POINTS_FOR_GAMES = 1;

const getCompetitorChoiceForMatchup = (competitor, choices, matchupName) => {
  const competitorChoices = _.find(choices, { competitor }).choices || {};
  return _.find(competitorChoices, { name: matchupName })
};

const getMatchupResult = (matchupName, matchups) => {
  const matchup = _.find(matchups, { name: matchupName });
  return matchup.result;
};

const getCompetitorResultForMatchup = (competitor, matchup, choices, matchups) => {
  const competitorChoice = getCompetitorChoiceForMatchup(competitor, choices, matchup);
  const results = getMatchupResult(matchup, matchups);

  return {
    pick: (competitorChoice.pick === results.winner),
    games: (competitorChoice.games === results.games)
  }
};

const getCompetitorResults = (competitor, choices, matchups) => {
  return matchups.map(matchup => {
    const { name } = matchup;
    return {
      name,
      results: getCompetitorResultForMatchup(competitor, name, choices, matchups)
    }
  });
}

const computeCompetitorScore = (competitor, choices, matchups) => {
  const competitorResults = getCompetitorResults(competitor, choices, matchups);
  return competitorResults.reduce((score, result) => {
    const { pick, games } = result.results;
    if (pick) {
      score = score + POINTS_FOR_PICK;

      if (games) {
        score = score + POINTS_FOR_GAMES;
      }
    }

    return score;
  }, 0);
};

module.exports = {
  getCompetitorChoiceForMatchup,
  getMatchupResult,
  getCompetitorResultForMatchup,
  getCompetitorResults,
  computeCompetitorScore
}
