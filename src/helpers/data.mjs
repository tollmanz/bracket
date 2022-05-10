import currentYear from "../config/year.mjs";
import picks2018 from "../config/2018/picks.hockey.mjs";
import results2018 from "../config/2018/results.hockey.mjs";
import picks2019 from "../config/2019/picks.hockey.mjs";
import results2019 from "../config/2019/results.hockey.mjs";
import picks2020 from "../config/2020/picks.hockey.mjs";
import results2020 from "../config/2020/results.hockey.mjs";
import picks2021 from "../config/2021/picks.hockey.mjs";
import results2021 from "../config/2021/results.hockey.mjs";
import picks2022 from "../config/2022/picks.hockey.mjs";
import results2022 from "../config/2022/results.hockey.mjs";

export const YEAR = currentYear;

const PICKS = {
  2018: picks2018,
  2019: picks2019,
  2020: picks2020,
  2021: picks2021,
  2022: picks2022,
};

const RESULTS = {
  2018: results2018,
  2019: results2019,
  2020: results2020,
  2021: results2021,
  2022: results2022,
};

export const getYearData = (year = currentYear) => {
  const picks = PICKS[year].split("\n");
  const results = RESULTS[year].split("\n");

  return {
    picks,
    results,
  };
};
