import fs from "fs";
import path from "path";

import * as core from "@actions/core";

import { YEARS } from "../../../src/config/years.mjs";
import TEAM_CODES from "../../../src/config/team-codes.mjs";

const workspace = process.env.GITHUB_WORKSPACE;
const config = path.join(workspace, "src", "config");

const ROUND_GAMES_MAP = {
  1: 8,
  2: 4,
  3: 2,
  4: 1,
};

/**
 * Round is a header in the file, e.g.,
 *
 *   --round 1--
 */
const roundRegex = new RegExp(/--(?:[ROUNDround]{5}\W+(?<round>\d))--/);

/**
 * Competitor is a twitter handle and this regex adheres to that format
 */
const competitorRegex = new RegExp(
  /^(?<competitor>(?<!\w)@[\w+]{1,15}\b):/,
  "g"
);

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
const picksRegex = new RegExp(
  /\W*?(?<team>[A-Za-z]{2,3})\W*?(?<games>\d)\W*?/,
  "g"
);

const isRoundHeader = (line) => line.match(roundRegex);
const hasCompetitor = (line) => line.match(competitorRegex);
const hasPicks = (line) => line.match(competitorRegex);
const isPickLine = (line) => hasCompetitor(line) && hasPicks(line);

const picks = YEARS.reduce((acc, year) => {
  const filepath = path.join(config, `${year}`, "picks.hockey");
  const data = fs.readFileSync(filepath, "utf8").split("\n");

  acc[year] = data;
  return acc;
}, {});

const validate = (picks) => {
  let success = true;
  let round = 0;

  Object.keys(picks).forEach((year) => {
    const lines = picks[year];

    lines.forEach((line) => {
      if (line === "") {
        console.log(`⚠️ skipping empty line`);
        return;
      }

      if (isRoundHeader(line)) {
        round = parseInt(roundRegex.exec(line).groups.round);
        console.log(
          `✅ line is a round header: ${line} (round: ${round}, year: ${year})`
        );
        return;
      }

      if (isPickLine(line)) {
        console.log(
          `✅ line is a pick line: ${line} (round: ${round}, year: ${year})`
        );
        const picks = [...line.matchAll(picksRegex)];

        if (picks.length !== ROUND_GAMES_MAP[round]) {
          const output = `❌ line does not have enough valid picks for the round: ${line} (round: ${round}, year: ${year})`;
          console.log(output);
          success = false;
        }

        picks.forEach((pick) => {
          if (!TEAM_CODES[pick.groups.team]) {
            const output = `❌ line has an invalid team: ${pick.groups.team} on ${line} (round: ${round}, year: ${year})`;
            console.log(output);
            success = false;
          }

          if (pick.groups.games < 4 || pick.groups.games > 7) {
            const output = `❌ line has an invalid number of games: ${pick.groups.games} for ${pick.groups.team} on ${line} (round: ${round}, year: ${year})`;
            console.log(output);
            success = false;
          }
        });

        return;
      }

      if (!hasCompetitor(line)) {
        const output = `❌ line does not have a competitor: ${line} (round: ${round}, year: ${year})`;
        console.log(output);
        success = false;
        return;
      }

      if (!hasPicks(line)) {
        const output = `❌ line does not have picks: ${line} (round: ${round}, year: ${year})`;
        console.log(output);
        success = false;
        return;
      }
    });
  });

  return success;
};

try {
  const result = validate(picks);

  if (result === false) {
    core.setFailed("One or more lines are invalid. See output for details");
  }
} catch (error) {
  core.setFailed(error.message);
}
