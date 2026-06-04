// One-time importer. Builds data/<year>.json + data/index.json from:
//   - the reconstruction workflow output (series matchups for legacy years, verified
//     against ground-truth winners/games and the known Stanley Cup champion), and
//   - the raw source pick files (re-parsed and mapped to series deterministically here,
//     so no LLM mapping errors and no dropped competitors).
// Rich years (2025/2026) are taken from the workflow output, which parsed their
// well-structured markdown directly. Run: node scripts/import-build.mjs <workflow-output.json>
import { readFile as read, writeFile as write } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const dataDir = path.join(root, 'data');
const outputPath = process.argv[2];
if (!outputPath) {
  console.error('Usage: node scripts/import-build.mjs <workflow-output.json>');
  process.exit(1);
}

const TEAM_NORMALIZE = { TB: 'TBL', CAL: 'CGY', WAS: 'WSH' };
const normTeam = (raw) => {
  const u = raw.toUpperCase();
  return TEAM_NORMALIZE[u] || u;
};

const SOURCES = {
  legacy: 'github:tollmanz/bracket',
  2025: 'Projects/picks markdown pool',
  2026: '2026 picks.md (Playoffs email thread)',
};

const people = JSON.parse(await read(path.join(dataDir, 'people.json'), 'utf8'));

// alias (lowercased) -> person id
const aliasToId = {};
for (const [id, p] of Object.entries(people)) {
  aliasToId[id.toLowerCase()] = id;
  for (const a of p.aliases || []) aliasToId[a.toLowerCase()] = id;
}
const resolvePerson = (handleOrName) => {
  const id = aliasToId[handleOrName.toLowerCase()];
  if (!id) throw new Error(`Unknown competitor "${handleOrName}" (add to data/people.json)`);
  return id;
};

// Parse a github picks.hockey.mjs body into { roundNumber: { handle: [{team, games}] } }
const parseGhPicks = (text) => {
  const rounds = {};
  let round = null;
  for (const rawLine of text.split('\n')) {
    const line = rawLine.trim();
    const rm = line.match(/--round\s+(\d)--/i);
    if (rm) { round = parseInt(rm[1], 10); rounds[round] = {}; continue; }
    const cm = line.match(/^(@\w+):\s*(.*)$/);
    if (!cm || round == null) continue;
    const handle = cm[1];
    const picks = [...cm[2].matchAll(/([A-Za-z]{2,3})\s*(\d)/g)].map((m) => ({
      team: normTeam(m[1]), games: parseInt(m[2], 10),
    }));
    rounds[round][handle] = picks;
  }
  return rounds;
};

const workflow = JSON.parse(await read(outputPath, 'utf8'));
const byYear = {};
for (const entry of workflow.result) byYear[entry.year] = entry;

const LEGACY = [2018, 2019, 2020, 2021, 2022];
const RICH = [2025, 2026];
const indexYears = [];

// ---- legacy: keep workflow matchups, re-derive picks from raw files ----
for (const year of LEGACY) {
  const wf = byYear[year].data;
  const raw = await read(path.join(root, 'sources', 'legacy', String(year), 'picks.hockey.mjs'), 'utf8');
  const ghPicks = parseGhPicks(raw);

  const rounds = wf.rounds.map((round) => {
    const handles = Object.keys(ghPicks[round.round] || {});
    const series = round.series.map((s) => {
      const teams = s.teams.map(normTeam);
      const picks = [];
      for (const handle of handles) {
        const pick = (ghPicks[round.round][handle] || []).find((p) => teams.includes(p.team));
        if (pick) picks.push({ person: resolvePerson(handle), team: pick.team, games: pick.games });
      }
      return {
        teams,
        result: s.result.status === 'final'
          ? { status: 'final', winner: normTeam(s.result.winner), games: s.result.games }
          : { status: 'pending', winner: null, games: null },
        picks,
      };
    });
    return { round: round.round, name: round.name, series };
  });

  const out = {
    year,
    status: wf.status,
    champion: wf.champion ? normTeam(wf.champion) : null,
    matchupsReconstructed: true,
    source: SOURCES.legacy,
    rounds,
  };
  if (wf.note) out.note = wf.note;
  await write(path.join(dataDir, `${year}.json`), JSON.stringify(out, null, 2) + '\n');
  indexYears.push({ year, status: out.status, champion: out.champion });
}

// ---- rich: take workflow data, normalize teams defensively ----
for (const year of RICH) {
  const wf = byYear[year].data;
  const rounds = wf.rounds.map((round) => ({
    round: round.round,
    name: round.name,
    series: round.series.map((s) => ({
      teams: s.teams.map(normTeam),
      result: s.result.status === 'final'
        ? { status: 'final', winner: normTeam(s.result.winner), games: s.result.games }
        : { status: 'pending', winner: null, games: null },
      picks: s.picks.map((p) => ({ person: resolvePerson(p.person), team: normTeam(p.team), games: p.games })),
    })),
  }));
  const out = {
    year,
    status: wf.status,
    champion: wf.champion ? normTeam(wf.champion) : null,
    matchupsReconstructed: false,
    source: SOURCES[year],
    rounds,
  };
  await write(path.join(dataDir, `${year}.json`), JSON.stringify(out, null, 2) + '\n');
  indexYears.push({ year, status: out.status, champion: out.champion });
}

indexYears.sort((a, b) => b.year - a.year);
const index = { defaultYear: 2026, years: indexYears };
await write(path.join(dataDir, 'index.json'), JSON.stringify(index, null, 2) + '\n');

console.log('Wrote', indexYears.map((y) => y.year).join(', '));
