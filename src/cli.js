const _ = require('lodash');
const yargs = require('yargs');

const { computeResults } = require('./actions/compute');

yargs
  .command(
    'get-score',
    'Get the current score',
    () => {},
    () => {
      const results = _.reverse(_.sortBy(computeResults(), 'score'));

      let i;
      for (i = 0; i < results.length; i++) {
        const str = `${i + 1}. ${results[i].name} ${results[i].score}`;
        console.log(str);
      }
    }
  )
  .argv
