import { compute } from "../helpers/compute.mjs";
import YEAR from "../config/year.mjs";
import { getYearData } from "../helpers/data.mjs";

export const computeResults = (year = YEAR) => {
  const yearData = getYearData(year);

  const results = compute(yearData.picks, yearData.results);

  return Object.keys(results).map((key) => ({
    name: key,
    score: results[key],
  }));
};
