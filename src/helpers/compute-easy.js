const teams = require("../config/team-codes");

/**
 * Round is a header in the file, e.g.,
 *
 *   --round 1--
 */
const roundRegex = /--(?:[ROUNDround]{5}\W+(?<round>\d))--/;

/**
 * Competitor is a twitter handle and this regex adheres to that format
 */
const competitorRegex = /^(?<competitor>(?<!\w)@[\w+]{1,15}\b):/;

/**
 * Parses a string of choices.
 *
 * The expected format is:
 *
 *   [username]: [team symbol] [games][delimiter][team symbol] [games]...
 *
 * e.g.,
 *
 *   @tollmanz: PIT 7, COL3, VGK  6, EDM 8, NYR 4, FLA 6, CBJ 5 CHI 2
 *   @tollmanz: PIT 7 COL3 VGK  6 EDM 8 NYR 4 FLA 6           CBJ 5 CHI 2
 *
 * Team symbols must be 2-3 characters long. Games can only be a digit and must be a single digit.
 * Aaron, you cannot choose a team in 10 games.
 */
const picksRegex = /\W*?(?<team>[A-Za-z]{2,3})\W*?(?<games>\d)\W*?/g;

/**
 * Points for the different rounds.
 */
const POINTS_FOR_PICK = {
  1: 1,
  2: 3,
  3: 5,
  4: 7,
};

/**
 * Bonus points for picking the correct number of games to win a round.
 */
const POINTS_FOR_GAMES = 2;

const normalizeTeamName = (team) => {
  if (teams[team]) {
    return teams[team];
  } else {
    throw new Error(`${team} is not a valid team`);
  }
};

/**
 * Calculates the match up score for a picked team, games, and the round.
 *
 * @param {string} team The team that was picked.
 * @param {int} games The number of games picked.
 * @param {int} round The round that the pick was made.
 * @param {object} results The results for the current round.
 * @returns {int} The match up score for the pick.
 */
const getMatchUpScore = (team, games, round, results) => {
  const pointsBase = POINTS_FOR_PICK[round];
  const pointsBonus = POINTS_FOR_GAMES;
  const roundTeam = results[`${round}-${team}`];

  let points = 0;

  if (roundTeam) {
    points += pointsBase;
  }

  if (roundTeam === games) {
    points += pointsBonus;
  }

  return points;
};

/**
 * Parses the results into an object.
 *
 * @param {string[]} resultLines The lines of results.
 * @returns {object} An object with keys being `round-team` and values being the number of games.
 */
const prepareResults = (lines) => {
  let round;
  const results = {};

  lines.forEach((line) => {
    // If the current line is a round header, set the round
    const roundMatch = line.match(roundRegex);

    if (roundMatch) {
      round = roundMatch.groups.round;

      // Nothing else will match so get out of here
      return;
    }

    const resultsMatch = [...line.matchAll(picksRegex)];

    if (resultsMatch) {
      resultsMatch.forEach((result) => {
        const team = normalizeTeamName(result.groups.team);
        results[`${round}-${team}`] = parseInt(result.groups.games, 10);
      });
    }
  });

  return results;
};

/**
 * Computes the score for each competitor.
 *
 * @param {string[]} pickLines The lines of the picks file.
 * @param {string[]} resultLines The lines of results.
 * @returns {object} An object with keys being `competitor` and values being the score.
 */
const compute = (pickLines, resultLines) => {
  let round;
  const scores = {};
  const results = prepareResults(resultLines);

  pickLines.forEach((line) => {
    // If the current line is a round header, set the round
    const roundMatch = line.match(roundRegex);

    if (roundMatch) {
      round = roundMatch.groups.round;

      // Nothing else will match so get out of here
      return;
    }

    // Find the current competitor
    const competitorMatch = line.match(competitorRegex);
    let competitor;

    if (competitorMatch) {
      competitor = competitorMatch.groups.competitor;
    }

    // Find the picks for the competitor
    const picksMatch = [...line.matchAll(picksRegex)];

    if (picksMatch) {
      const scoreForRound = picksMatch.reduce((score, pick) => {
        const { team, games } = pick.groups;

        // Map the team name to an official team code
        const normalizedTeam = normalizeTeamName(team);

        // Do the scoring here
        return (
          score +
          getMatchUpScore(normalizedTeam, parseInt(games, 10), round, results)
        );
      }, 0);

      // If we have a competitor and a score, add it to the scores object
      if (competitor && scoreForRound) {
        if (!scores[competitor]) {
          scores[competitor] = 0;
        }

        scores[competitor] += scoreForRound;
      }
    }
  });

  return scores;
};
