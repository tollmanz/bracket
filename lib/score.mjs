// Pure scoring and aggregation. No DOM, no I/O. Used by the Eleventy data loader,
// the renderer, and scripts/verify-data.mjs so the rules live in exactly one place.

export const pickPoints = (pick, result, round, rules) => {
  if (!pick || !result || result.status !== 'final') return 0;
  if (pick.team !== result.winner) return 0;
  const base = rules.basePoints[round] || 0;
  const bonus = pick.games === result.games ? rules.gamesBonus : 0;
  return base + bonus;
};

export const pickFor = (series, person) => series.picks.find((p) => p.person === person) || null;

// Every person that appears in any pick this year, in first-appearance order.
export const rosterFor = (year) => {
  const seen = [];
  for (const round of year.rounds) {
    for (const series of round.series) {
      for (const p of series.picks) if (!seen.includes(p.person)) seen.push(p.person);
    }
  }
  return seen;
};

// { person: { total, byRound: { round: pts } } }
export const scoreYear = (year, rules, roster = rosterFor(year)) => {
  const scores = {};
  for (const person of roster) scores[person] = { total: 0, byRound: {} };
  for (const round of year.rounds) {
    for (const person of roster) {
      let rp = 0;
      for (const series of round.series) rp += pickPoints(pickFor(series, person), series.result, round.round, rules);
      scores[person].byRound[round.round] = rp;
      scores[person].total += rp;
    }
  }
  return scores;
};

// Sorted [{ person, total, byRound }], highest first.
export const standings = (year, rules, roster = rosterFor(year)) => {
  const scores = scoreYear(year, rules, roster);
  return roster
    .map((person) => ({ person, ...scores[person] }))
    .sort((a, b) => b.total - a.total || a.person.localeCompare(b.person));
};

export const roundIsFinal = (round) =>
  round.series.length > 0 && round.series.every((s) => s.result.status === 'final');

// Persons holding the max value in a totals map (ties shared). Empty if max <= 0.
const topScorers = (roster, valueOf) => {
  const max = Math.max(0, ...roster.map(valueOf));
  if (max <= 0) return [];
  return roster.filter((p) => valueOf(p) === max);
};

// All-time leaderboard across every season.
// Championship = finishing first in a COMPLETED pool (ties shared).
// Round won = top score in any fully-final round (ties shared), across all years.
export const aggregate = (years, rules) => {
  const agg = {};
  const ensure = (p) => (agg[p] ||= {
    seasons: new Set(), totalPoints: 0, championships: 0, championYears: [], roundsWon: 0,
  });

  for (const year of years) {
    const roster = rosterFor(year);
    const scores = scoreYear(year, rules, roster);
    for (const p of roster) {
      const a = ensure(p);
      a.seasons.add(year.year);
      a.totalPoints += scores[p].total;
    }
    if (year.status === 'complete') {
      for (const p of topScorers(roster, (p) => scores[p].total)) {
        const a = ensure(p);
        a.championships += 1;
        a.championYears.push(year.year);
      }
    }
    for (const round of year.rounds) {
      if (!roundIsFinal(round)) continue;
      const roundScore = (p) =>
        round.series.reduce((s, ser) => s + pickPoints(pickFor(ser, p), ser.result, round.round, rules), 0);
      for (const p of topScorers(roster, roundScore)) ensure(p).roundsWon += 1;
    }
  }

  return Object.entries(agg)
    .map(([person, a]) => ({
      person,
      seasons: a.seasons.size,
      totalPoints: a.totalPoints,
      championships: a.championships,
      championYears: a.championYears.sort((x, y) => x - y),
      roundsWon: a.roundsWon,
    }))
    .sort((x, y) =>
      y.championships - x.championships ||
      y.roundsWon - x.roundsWon ||
      y.totalPoints - x.totalPoints ||
      x.person.localeCompare(y.person));
};
