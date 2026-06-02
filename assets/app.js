// Data-driven renderer for the BRACKET pick 'em scoreboard.
// Source of truth is the JSON in /data; scores are computed here from rules.json
// so nothing derived is stored and totals can never drift from the facts.

const DATA = 'data';

// Stable jersey/sprite color per person.
const PERSON_COLORS = {
  zack: '#f87858',
  john: '#f83800',
  jonathan: '#00e8d8',
  flynn: '#0078f8',
  aaron: '#00b800',
  nacin: '#f8d800',
  brothernacin: '#b8b8f8',
  fathernacin: '#f878b8',
  thoronas: '#f8b800',
  cklosowski: '#a878f8',
};
const DEFAULT_COLOR = '#cccccc';

let RULES = null;
let PEOPLE = null;
let INDEX = null;

const $ = (sel) => document.querySelector(sel);
const el = (tag, attrs = {}, html) => {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'class') node.className = v;
    else node.setAttribute(k, v);
  }
  if (html != null) node.innerHTML = html;
  return node;
};
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

const name = (id) => (PEOPLE[id] && PEOPLE[id].name) || id;
const upper = (id) => name(id).toUpperCase();
const color = (id) => PERSON_COLORS[id] || DEFAULT_COLOR;

const fetchJSON = async (path) => {
  const res = await fetch(path, { cache: 'no-cache' });
  if (!res.ok) throw new Error(`Failed to load ${path}: ${res.status}`);
  return res.json();
};

// ---- scoring ---------------------------------------------------------------

// Points for one pick against a final series result.
const pickPoints = (pick, result, round) => {
  if (!pick || !result || result.status !== 'final') return 0;
  if (pick.team !== result.winner) return 0;
  const base = RULES.basePoints[round] || 0;
  const bonus = pick.games === result.games ? RULES.gamesBonus : 0;
  return base + bonus;
};

// Roster = every person that appears in any pick this year, ordered by first appearance.
const rosterFor = (year) => {
  const seen = [];
  for (const round of year.rounds) {
    for (const series of round.series) {
      for (const p of series.picks) if (!seen.includes(p.person)) seen.push(p.person);
    }
  }
  return seen;
};

const pickFor = (series, person) => series.picks.find((p) => p.person === person) || null;

// { person: { total, byRound: {round: pts} } }
const scoreYear = (year, roster) => {
  const scores = {};
  for (const person of roster) scores[person] = { total: 0, byRound: {} };
  for (const round of year.rounds) {
    for (const person of roster) {
      let rp = 0;
      for (const series of round.series) rp += pickPoints(pickFor(series, person), series.result, round.round);
      scores[person].byRound[round.round] = rp;
      scores[person].total += rp;
    }
  }
  return scores;
};

// ---- rendering -------------------------------------------------------------

const ORDINAL = ['', '1ST', '2ND', '3RD', '4TH', '5TH', '6TH', '7TH', '8TH', '9TH', '10TH'];

const skaterSvg = (jersey) => `
  <svg width="24" height="30" viewBox="0 0 12 15" shape-rendering="crispEdges">
    <rect x="4" y="0" width="4" height="2" fill="${jersey}"/>
    <rect x="3" y="2" width="6" height="2" fill="#fcd8a8"/>
    <rect x="3" y="4" width="6" height="4" fill="${jersey}"/>
    <rect x="4" y="5" width="4" height="1" fill="#fcfcfc"/>
    <rect x="3" y="8" width="6" height="3" fill="#000040"/>
    <rect x="3" y="11" width="2" height="2" fill="#fcfcfc"/>
    <rect x="7" y="11" width="2" height="2" fill="#fcfcfc"/>
    <rect x="2" y="13" width="4" height="2" fill="#000"/>
    <rect x="6" y="13" width="4" height="2" fill="#000"/>
  </svg>`;

const renderChampion = (year, scores, roster) => {
  if (year.status !== 'complete' || !year.champion) {
    const headline = year.note ? 'DATA INCOMPLETE' : 'PLAYOFFS IN PROGRESS';
    const detail = year.note ? `<div class="champ-winner">${esc(year.note)}</div>` : '';
    return `<section class="champion-banner">
      <div class="cup">STANLEY CUP</div>
      <div class="champ-team status-live">${headline}</div>
      ${detail}
    </section>`;
  }
  const ranked = roster.slice().sort((a, b) => scores[b].total - scores[a].total);
  const winner = ranked[0];
  return `<section class="champion-banner">
    <div class="cup">★ STANLEY CUP CHAMPION ★</div>
    <div class="champ-team">${esc(year.champion)}</div>
    <div class="champ-winner">POOL WINNER: <b>${esc(upper(winner))}</b> · ${scores[winner].total} PTS</div>
  </section>`;
};

const renderStandings = (year, scores, roster) => {
  const ranked = roster.slice().sort((a, b) => scores[b].total - scores[a].total);
  const rounds = year.rounds.map((r) => r.round);
  const items = ranked.map((person, i) => {
    const rank = i + 1;
    const s = scores[person];
    const breakdown = rounds.map((r) => `R${r}: ${s.byRound[r] || 0}`);
    const first = breakdown[0] || '';
    const rest = breakdown.slice(1).join(' · ');
    return `<li class="${rank <= 3 ? 'rank-' + rank : ''}">
      <span class="rank-num">${ORDINAL[rank] || rank + 'TH'}</span>
      <span class="sprite" aria-hidden="true">${skaterSvg(color(person))}</span>
      <span class="name">${esc(upper(person))}</span>
      <span class="r1">${esc(first)}</span>
      <span class="r2">${esc(rest)}</span>
      <span class="total">${s.total} PTS</span>
    </li>`;
  }).join('');
  return `<section class="panel"><h2>★ HIGH SCORES ★</h2><ol class="standings">${items}</ol></section>`;
};

const pickCellClass = (pick, result) => {
  if (!result || result.status !== 'final') return 'pending';
  if (!pick) return 'miss';
  if (pick.team !== result.winner) return 'miss';
  return pick.games === result.games ? 'hit-bonus' : 'hit';
};

const ARROWS = { 1: '►', 2: '►►', 3: '►►►', 4: '►►►►' };

const renderRound = (round, roster) => {
  const head = `<tr><th>#</th><th class="col-series">SERIES</th><th>RESULT</th>${
    roster.map((p) => `<th>${esc(upper(p))}</th>`).join('')}</tr>`;

  const rows = round.series.map((series, i) => {
    const resultTxt = series.result.status === 'final'
      ? `${esc(series.result.winner)} ${series.result.games}`
      : '<span class="in-progress">TBD</span>';
    const cells = roster.map((p) => {
      const pick = pickFor(series, p);
      const cls = pickCellClass(pick, series.result);
      const txt = pick ? `${esc(pick.team)} ${pick.games}` : '—';
      return `<td class="${cls}">${txt}</td>`;
    }).join('');
    return `<tr><td>${i + 1}</td><td class="col-series">${esc(series.teams[0])} vs ${esc(series.teams[1])}</td><td class="col-result">${resultTxt}</td>${cells}</tr>`;
  }).join('');

  // Points-earned table (only for rounds with at least one final result).
  const hasFinal = round.series.some((s) => s.result.status === 'final');
  let scoreTable = '';
  if (hasFinal) {
    const shead = `<tr><th class="col-series">SERIES</th>${roster.map((p) => `<th class="num">${esc(upper(p))}</th>`).join('')}</tr>`;
    const totals = Object.fromEntries(roster.map((p) => [p, 0]));
    const srows = round.series.map((series) => {
      const cells = roster.map((p) => {
        const pts = pickPoints(pickFor(series, p), series.result, round.round);
        totals[p] += pts;
        return `<td class="num">${series.result.status === 'final' ? pts : '–'}</td>`;
      }).join('');
      return `<tr><td class="col-series">${esc(series.teams[0])} vs ${esc(series.teams[1])}</td>${cells}</tr>`;
    }).join('');
    const foot = `<tr><td class="col-series">ROUND ${round.round} TOTAL</td>${roster.map((p) => `<td class="num">${totals[p]}</td>`).join('')}</tr>`;
    scoreTable = `<h3>POINTS EARNED</h3><table class="score-table"><thead>${shead}</thead><tbody>${srows}</tbody><tfoot>${foot}</tfoot></table>`;
  }

  const arrow = ARROWS[round.round] || '►';
  return `<section class="panel">
    <h2>${arrow} ${esc(round.name.toUpperCase())}</h2>
    <table><thead>${head}</thead><tbody>${rows}</tbody></table>
    ${scoreTable}
  </section>`;
};

const renderLegend = () => {
  const tiers = Object.entries(RULES.basePoints)
    .map(([r, pts]) => `R${r}: BASE ${pts} PT + ${RULES.gamesBonus} PT GAMES BONUS`).join(' &nbsp; • &nbsp; ');
  return `<section class="panel"><h2>LEGEND</h2>
    <div class="legend">
      <span class="hit-bonus">CORRECT + GAMES = FULL PTS</span>
      <span class="hit">CORRECT TEAM = BASE PTS</span>
      <span class="miss">WRONG = 0 PTS</span>
      <span class="in-progress">IN PROGRESS</span>
    </div>
    <p style="text-align:center;margin-top:8px;color:var(--ice);font-size:8px;">${tiers}</p>
  </section>`;
};

const renderMarquee = (year, scores, roster) => {
  const ranked = roster.slice().sort((a, b) => scores[b].total - scores[a].total);
  const leader = ranked[0];
  const bits = [`★ BRACKET ${year.year} ★`];
  if (leader) bits.push(`${upper(leader)} LEADS WITH ${scores[leader].total} PTS`);
  if (year.status === 'complete' && year.champion) bits.push(`${year.champion} WINS THE CUP`);
  else bits.push('PLAYOFFS IN PROGRESS');
  if (year.note) bits.push(year.note.toUpperCase());
  $('#marquee-track').textContent = bits.join('   ★   ') + '   ★';
};

// ---- app -------------------------------------------------------------------

const renderYearbar = (activeYear) => {
  const bar = $('#yearbar');
  bar.innerHTML = '';
  INDEX.years
    .slice()
    .sort((a, b) => b.year - a.year)
    .forEach((y) => {
      const btn = el('button', { class: 'year-btn', type: 'button' }, String(y.year));
      if (y.year === activeYear) btn.setAttribute('aria-current', 'true');
      btn.addEventListener('click', () => { location.hash = String(y.year); });
      bar.appendChild(btn);
    });
};

const renderYear = async (yearNum) => {
  $('#hero-heading').textContent = `BRACKET ${yearNum}`;
  document.title = `BRACKET ${yearNum} — STANLEY CUP PICK 'EM`;
  renderYearbar(yearNum);
  $('#app').innerHTML = '<div class="loading">LOADING…</div>';

  const year = await fetchJSON(`${DATA}/${yearNum}.json`);
  const roster = rosterFor(year);
  const scores = scoreYear(year, roster);

  const html = [
    renderChampion(year, scores, roster),
    renderStandings(year, scores, roster),
    ...year.rounds.map((r) => renderRound(r, roster)),
    renderLegend(),
  ].join('');
  $('#app').innerHTML = html;
  renderMarquee(year, scores, roster);
};

const currentYearFromHash = () => {
  const h = parseInt(location.hash.replace('#', ''), 10);
  if (INDEX.years.some((y) => y.year === h)) return h;
  return INDEX.defaultYear;
};

const main = async () => {
  try {
    [RULES, PEOPLE, INDEX] = await Promise.all([
      fetchJSON(`${DATA}/rules.json`),
      fetchJSON(`${DATA}/people.json`),
      fetchJSON(`${DATA}/index.json`),
    ]);
  } catch (err) {
    $('#app').innerHTML = `<div class="loading">FAILED TO LOAD DATA.<br>${esc(err.message)}<br><br>Run a local server (npm start) and open the served URL.</div>`;
    return;
  }
  window.addEventListener('hashchange', () => renderYear(currentYearFromHash()));
  await renderYear(currentYearFromHash());
};

main();
