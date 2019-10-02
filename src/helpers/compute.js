const _ = require('lodash');

const POINTS_FOR_PICK = {
  1: 1,
  2: 2,
  3: 4,
  4: 8
};
const POINTS_FOR_GAMES = 2;

const getRoundFromGame = (game) => {
  const mapping = {
    1: 1,
    2: 1,
    3: 1,
    4: 1,
    5: 2,
    6: 2,
    7: 3,
    8: 4
  };

  const gameNumber = game.slice(-1);
  return mapping[gameNumber] || 0;
};

const getPointsForGame = (game) => {
  const round = getRoundFromGame(game);
  return POINTS_FOR_PICK[round];
};

const getCompetitorChoiceForMatchup = (competitor, choices, matchupName) => {
  const competitorChoices = _.get(_.find(choices, { competitor }), 'choices') || {};
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
    pick: (competitorChoice && competitorChoice.pick === results.winner),
    games: ( competitorChoice && competitorChoice.games === results.games)
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
      score = score + getPointsForGame(result.name);

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
