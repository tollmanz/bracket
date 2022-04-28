import _ from "lodash";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";

import { computeResults } from "./actions/compute.mjs";

yargs(hideBin(process.argv)).command(
  "get-score",
  "Get the current score",
  () => {},
  () => {
    const results = _.reverse(_.sortBy(computeResults(), "score"));

    let i;
    for (i = 0; i < results.length; i++) {
      const str = `${i + 1}. ${results[i].name} ${results[i].score}`;
      console.log(str);
    }
  }
).argv;
