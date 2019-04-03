const _ = require('lodash');

const { computeResults } = require('../actions/compute');

module.exports = () => {
  const results = _.reverse(_.sortBy(computeResults(), 'score'));
  const resp = [];

  let i;
  for (i = 0; i < results.length; i++) {
    resp.push(`${i + 1}. ${results[i].name} ${results[i].score}`);
  }

  return resp.join('\n');
};
