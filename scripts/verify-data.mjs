// Validates the data files and recomputes scores from facts using the shared
// lib/score.mjs logic. Fails (non-zero exit) on schema problems or when computed
// standings disagree with the documented final totals. Run: node scripts/verify-data.mjs
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { pickPoints } from '../lib/score.mjs';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const dataDir = path.join(root, 'data');
const readJSON = async (p) => JSON.parse(await readFile(path.join(dataDir, p), 'utf8'));

// Documented final standings (person id -> total) we are confident about.
const DOCUMENTED = {
  2025: { aaron: 37, jonathan: 32, zack: 31, john: 27, flynn: 23 },
  2026: { john: 39, zack: 27, flynn: 26, jonathan: 19, aaron: 12 },
};

const errors = [];
const fail = (msg) => errors.push(msg);

const rules = await readJSON('rules.json');
const people = await readJSON('people.json');
const index = await readJSON('index.json');

for (const meta of index.years) {
  const year = await readJSON(`${meta.year}.json`);
  if (year.year !== meta.year) fail(`${meta.year}.json: year field ${year.year} != ${meta.year}`);

  const roster = new Set();
  for (const round of year.rounds) {
    for (const series of round.series) {
      if (series.teams.length !== 2 || series.teams[0] === series.teams[1]) {
        fail(`${meta.year} ${round.name}: bad teams ${JSON.stringify(series.teams)}`);
      }
      if (series.result.status === 'final' && !series.teams.includes(series.result.winner)) {
        fail(`${meta.year} ${round.name}: winner ${series.result.winner} not in ${JSON.stringify(series.teams)}`);
      }
      for (const p of series.picks) {
        roster.add(p.person);
        if (!people[p.person]) fail(`${meta.year}: unknown person id "${p.person}"`);
        if (!series.teams.includes(p.team)) {
          fail(`${meta.year} ${round.name} ${series.teams.join(' vs ')}: ${p.person} picked ${p.team}, not in series`);
        }
      }
    }
  }

  const totals = {};
  for (const person of roster) totals[person] = 0;
  for (const round of year.rounds) {
    for (const series of round.series) {
      for (const person of roster) {
        totals[person] += pickPoints(series.picks.find((p) => p.person === person), series.result, round.round, rules);
      }
    }
  }

  const standings = [...roster].sort((a, b) => totals[b] - totals[a]);
  const top = standings.map((p) => `${p}:${totals[p]}`).join(' ');
  console.log(`${meta.year} [${year.status}] champion=${year.champion ?? '—'}  ${top}`);

  const doc = DOCUMENTED[meta.year];
  if (doc) {
    for (const [person, expected] of Object.entries(doc)) {
      if (totals[person] !== expected) {
        fail(`${meta.year}: ${person} computed ${totals[person]} != documented ${expected}`);
      }
    }
  }
}

if (errors.length) {
  console.error(`\n${errors.length} problem(s):`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}
console.log('\nAll data verified: schema OK, scores recompute, documented totals match.');
