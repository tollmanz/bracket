// Build-time data loader. Reads the canonical JSON in /data and exposes it to every
// template: people, rules, and the full year objects (sorted newest first).
// Computation (standings, leaderboard) lives in lib/score.mjs and runs in the renderer.
import { readFile, readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const dataDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../data');
const readJSON = async (file) => JSON.parse(await readFile(path.join(dataDir, file), 'utf8'));

export default async function () {
  const [people, rules, index] = await Promise.all([
    readJSON('people.json'),
    readJSON('rules.json'),
    readJSON('index.json'),
  ]);

  const files = (await readdir(dataDir)).filter((f) => /^\d{4}\.json$/.test(f));
  const years = (await Promise.all(files.map(readJSON))).sort((a, b) => b.year - a.year);

  return { people, rules, index, years };
}
