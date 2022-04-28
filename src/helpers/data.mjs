import fs from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

import currentYear from "../config/year.mjs";
import { YEARS } from "../config/years.mjs";

export const YEAR = currentYear;

const PICKS = {};
const RESULTS = {};

const basePath = join(__dirname, "..", "/config");

YEARS.forEach((year) => {
  const picksFileName = join(basePath, `${year}`, "picks.hockey");
  const resultsFileName = join(basePath, `${year}`, "results.hockey");

  PICKS[year] = fs.readFileSync(picksFileName, "utf8");
  RESULTS[year] = fs.readFileSync(resultsFileName, "utf8");
}, {});

export const getYearData = (year = currentYear) => {
  const picks = PICKS[year].split("\n");
  const results = RESULTS[year].split("\n");

  return {
    picks,
    results,
  };
};
