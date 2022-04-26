const fs = require("fs");
const path = require("path");

const configPath = path.join(__dirname, "..", "/config");
const years = [2018, 2019, 2020, 2021];
const paths = years.map((year) => path.join(configPath, `${year}`));
const roundsMap = {
  1: ["WC1", "WC2", "WC3", "WC4", "EC1", "EC2", "EC3", "EC4"],
  2: ["WC5", "WC6", "EC5", "EC6"],
  3: ["WC7", "EC7"],
  4: ["SC8"],
};

const buildResults = (paths) => {
  const filename = "matchups.json";

  paths.forEach((pathValue) => {
    // Read the file
    const file = fs.readFileSync(path.join(pathValue, filename), "utf8");

    // Parse the file
    const matchups = JSON.parse(file);

    // Build the results
    let lines = Object.keys(roundsMap).map((round) => {
      const keys = roundsMap[round];
      const results = matchups
        .filter((matchup) => keys.includes(matchup.name))
        .map((matchup) => {
          return `${matchup.result.winner} ${matchup.result.games}`;
        })
        .join(", ");

      return `--round ${round}--\n${results}`;
    });

    fs.writeFileSync(
      path.join(pathValue, "results.hockey"),
      lines.join("\n\n")
    );
  });
};

buildResults(paths);
