// HTML rendering for the static site. Pure string builders; takes the data the
// Eleventy loader assembled and returns markup. Scoring comes from score.mjs.
import { pickPoints, pickFor, rosterFor, scoreYear, standings, aggregate } from './score.mjs';

const PERSON_COLORS = {
  zack: '#f87858', john: '#f83800', jonathan: '#00e8d8', flynn: '#0078f8', aaron: '#00b800',
  nacin: '#f8d800', brothernacin: '#b8b8f8', fathernacin: '#f878b8',
  cklosowski: '#a878f8', ttollman: '#f85898',
};
const DEFAULT_COLOR = '#cccccc';

export const esc = (s) =>
  String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

const ORDINAL = ['', '1ST', '2ND', '3RD', '4TH', '5TH', '6TH', '7TH', '8TH', '9TH', '10TH'];
const ARROWS = { 1: '►', 2: '►►', 3: '►►►', 4: '►►►►' };

const ctx = (bracket) => {
  const name = (id) => (bracket.people[id] && bracket.people[id].name) || id;
  return {
    name,
    upper: (id) => name(id).toUpperCase(),
    color: (id) => PERSON_COLORS[id] || DEFAULT_COLOR,
  };
};

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

// ---- page shell ------------------------------------------------------------

const heroArt = (jersey, stickLeft) => `
  <div class="hero-art" aria-hidden="true">
    <svg width="96" height="120" viewBox="0 0 24 30" shape-rendering="crispEdges">
      <rect x="9" y="2" width="6" height="2" fill="${jersey}"/><rect x="8" y="4" width="8" height="3" fill="${jersey}"/>
      <rect x="9" y="7" width="6" height="2" fill="#fcd8a8"/><rect x="10" y="7" width="1" height="1" fill="#000"/><rect x="13" y="7" width="1" height="1" fill="#000"/>
      <rect x="7" y="9" width="10" height="6" fill="${jersey}"/><rect x="9" y="10" width="6" height="1" fill="#fcfcfc"/><rect x="11" y="11" width="2" height="3" fill="#fcfcfc"/>
      <rect x="5" y="10" width="2" height="4" fill="${jersey}"/><rect x="17" y="10" width="2" height="4" fill="${jersey}"/>
      <rect x="8" y="15" width="8" height="4" fill="#000040"/>
      <rect x="8" y="19" width="3" height="5" fill="#fcfcfc"/><rect x="13" y="19" width="3" height="5" fill="#fcfcfc"/>
      <rect x="7" y="24" width="5" height="2" fill="#000"/><rect x="12" y="24" width="5" height="2" fill="#000"/>
      ${stickLeft
        ? '<rect x="3" y="6" width="1" height="14" fill="#a85820"/><rect x="2" y="20" width="4" height="2" fill="#a85820"/>'
        : '<rect x="20" y="6" width="1" height="14" fill="#a85820"/><rect x="18" y="20" width="4" height="2" fill="#a85820"/>'}
    </svg>
  </div>`;

const nav = (bracket, active) => {
  const link = (href, label, isActive) =>
    `<a class="year-btn" href="${href}"${isActive ? ' aria-current="true"' : ''}>${label}</a>`;
  const years = bracket.years
    .map((y) => link(`/${y.year}/`, String(y.year), active === y.year))
    .join('');
  return `<nav class="yearbar" aria-label="Seasons">
    ${link('/', '★ ALL-TIME', active === 'leaderboard')}${years}
  </nav>`;
};

export const page = ({ heading, subtitle, active, bracket, body, marquee, scripts = [] }) => `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(heading)} — STANLEY CUP PICK 'EM</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/assets/styles.css">
</head>
<body>
<div class="hero">
  ${heroArt('#f83800', false)}
  <div class="hero-title">
    <h1>${esc(heading)}</h1>
    <div class="subtitle">★ ${esc(subtitle)} ★</div>
    <svg width="32" height="32" viewBox="0 0 16 16" class="puck-spin" style="margin-top:12px" shape-rendering="crispEdges" aria-hidden="true">
      <rect x="3" y="6" width="10" height="4" fill="#000"/><rect x="4" y="5" width="8" height="1" fill="#000"/>
      <rect x="4" y="10" width="8" height="1" fill="#000"/><rect x="5" y="6" width="6" height="1" fill="#484848"/>
    </svg>
  </div>
  ${heroArt('#0078f8', true)}
</div>
<div class="rink" aria-hidden="true"></div>
${nav(bracket, active)}
<main>${body}</main>
<div class="marquee" aria-hidden="true"><span class="marquee-track">${esc(marquee)}</span></div>
${scripts.map((s) => `<script src="${s}" defer></script>`).join('')}
</body>
</html>
`;

// ---- all-time leaderboard (index) ------------------------------------------

export const renderLeaderboard = (bracket) => {
  const { upper, color } = ctx(bracket);
  const board = aggregate(bracket.years, bracket.rules);

  const rows = board.map((b, i) => {
    const rank = i + 1;
    const cups = b.championships > 0 ? '🏆'.repeat(b.championships) : '–';
    const champYears = b.championYears.length ? `<div class="sub">${b.championYears.join(', ')}</div>` : '';
    return `<tr class="${rank <= 3 ? 'rank-' + rank : ''}">
      <td class="rank-num">${ORDINAL[rank] || rank + 'TH'}</td>
      <td class="player col-player" data-sort="${esc(upper(b.person))}"><span class="sprite">${skaterSvg(color(b.person))}</span>
        <span><span class="pname">${esc(upper(b.person))}</span>${champYears}</span></td>
      <td class="num cups col-cups" data-sort="${b.championships}" title="${b.championships} championship(s)">${cups}</td>
      <td class="num col-rounds" data-sort="${b.roundsWon}">${b.roundsWon}</td>
      <td class="num pts col-pts" data-sort="${b.totalPoints}">${b.totalPoints}</td>
      <td class="num col-seasons" data-sort="${b.seasons}">${b.seasons}</td>
    </tr>`;
  }).join('');

  // Sortable header buttons. Default order (server-rendered) is championships desc.
  // A little pixel hockey stick on each sortable header signals it can be sorted.
  const stick = '<span class="sort-stick" aria-hidden="true"><svg width="12" height="12" viewBox="0 0 12 12" shape-rendering="crispEdges">' +
    '<rect x="9" y="1" width="2" height="2"/><rect x="7" y="3" width="2" height="2"/>' +
    '<rect x="5" y="5" width="2" height="2"/><rect x="3" y="7" width="2" height="2"/>' +
    '<rect x="1" y="9" width="5" height="2"/></svg></span>';
  const th = (key, type, label, def) =>
    `<th class="${type === 'num' ? 'num' : 'player'}"${def ? ` aria-sort="${def}"` : ''}>` +
    `<button type="button" class="th-sort" data-key="${key}" data-type="${type}">${label} ${stick}<span class="sort-ind"></span></button></th>`;
  const head = `<tr>
    <th>RANK</th>
    ${th('player', 'text', 'PLAYER')}
    ${th('cups', 'num', 'CUPS', 'descending')}
    ${th('rounds', 'num', 'ROUNDS WON')}
    ${th('pts', 'num', 'TOTAL PTS')}
    ${th('seasons', 'num', 'SEASONS')}
  </tr>`;

  // Champion-by-year strip.
  const champs = bracket.years.map((year) => {
    if (year.status !== 'complete') {
      return `<li><span class="cy-year">${year.year}</span> <span class="in-progress">${year.note ? 'INCOMPLETE' : 'IN PROGRESS'}</span></li>`;
    }
    const winners = standings(year, bracket.rules).filter((s, _, arr) => s.total === arr[0].total);
    const names = winners.map((w) => upper(w.person)).join(' & ');
    return `<li><span class="cy-year">${year.year}</span> <b>${esc(names)}</b> <span class="cy-team">${esc(year.champion)} took the Cup</span></li>`;
  }).join('');

  return `<section class="panel">
    <h2>★ ALL-TIME LEADERBOARD ★</h2>
    <table class="leaderboard" id="leaderboard">
      <thead>${head}</thead>
      <tbody>${rows}</tbody>
    </table>
    <p class="board-note">Championships count first-place finishes in completed pools; rounds won count top score in any finished round (ties shared).</p>
  </section>
  <section class="panel">
    <h2>★ CHAMPIONS BY SEASON ★</h2>
    <ul class="champions">${champs}</ul>
  </section>`;
};

// ---- per-year scoreboard ---------------------------------------------------

const championBanner = (year, board) => {
  if (year.status !== 'complete' || !year.champion) {
    const headline = year.note ? 'DATA INCOMPLETE' : 'PLAYOFFS IN PROGRESS';
    const detail = year.note ? `<div class="champ-winner">${esc(year.note)}</div>` : '';
    return `<section class="champion-banner"><div class="cup">STANLEY CUP</div>
      <div class="champ-team status-live">${headline}</div>${detail}</section>`;
  }
  const winners = board.filter((s) => s.total === board[0].total);
  return `<section class="champion-banner">
    <div class="cup">★ STANLEY CUP CHAMPION ★</div>
    <div class="champ-team">${esc(year.champion)}</div>
    <div class="champ-winner">POOL WINNER: <b>${winners.map((w) => esc(w.upper)).join(' &amp; ')}</b> · ${board[0].total} PTS</div>
  </section>`;
};

const standingsSection = (board, rounds) => {
  const roundNums = rounds.map((r) => r.round);
  const items = board.map((s, i) => {
    const rank = i + 1;
    const chips = roundNums.map((r) => `<span class="rd">R${r}: ${s.byRound[r] || 0}</span>`).join('');
    return `<li class="${rank <= 3 ? 'rank-' + rank : ''}">
      <span class="rank-num">${ORDINAL[rank] || rank + 'TH'}</span>
      <span class="sprite" aria-hidden="true">${skaterSvg(s.color)}</span>
      <span class="name">${esc(s.upper)}</span>
      <span class="rounds">${chips}</span>
      <span class="total">${s.total} PTS</span>
    </li>`;
  }).join('');
  return `<section class="panel"><h2>★ HIGH SCORES ★</h2><ol class="standings">${items}</ol></section>`;
};

const pickCellClass = (pick, result) => {
  if (!result || result.status !== 'final') return 'pending';
  if (!pick || pick.team !== result.winner) return 'miss';
  return pick.games === result.games ? 'hit-bonus' : 'hit';
};

const roundSection = (round, roster, upper, rules) => {
  const head = `<tr><th>#</th><th class="col-series">SERIES</th><th>RESULT</th>${
    roster.map((p) => `<th>${esc(upper(p))}</th>`).join('')}</tr>`;
  const rows = round.series.map((series, i) => {
    const resultTxt = series.result.status === 'final'
      ? `${esc(series.result.winner)} ${series.result.games}`
      : '<span class="in-progress">TBD</span>';
    const cells = roster.map((p) => {
      const pick = pickFor(series, p);
      const txt = pick ? `${esc(pick.team)} ${pick.games}` : '—';
      return `<td class="${pickCellClass(pick, series.result)}">${txt}</td>`;
    }).join('');
    return `<tr><td>${i + 1}</td><td class="col-series">${esc(series.teams[0])} vs ${esc(series.teams[1])}</td><td class="col-result">${resultTxt}</td>${cells}</tr>`;
  }).join('');

  const hasFinal = round.series.some((s) => s.result.status === 'final');
  let scoreTable = '';
  if (hasFinal) {
    const shead = `<tr><th class="col-series">SERIES</th>${roster.map((p) => `<th class="num">${esc(upper(p))}</th>`).join('')}</tr>`;
    const totals = Object.fromEntries(roster.map((p) => [p, 0]));
    const srows = round.series.map((series) => {
      const cells = roster.map((p) => {
        const pts = pickPoints(pickFor(series, p), series.result, round.round, rules);
        totals[p] += pts;
        return `<td class="num">${series.result.status === 'final' ? pts : '–'}</td>`;
      }).join('');
      return `<tr><td class="col-series">${esc(series.teams[0])} vs ${esc(series.teams[1])}</td>${cells}</tr>`;
    }).join('');
    const foot = `<tr><td class="col-series">ROUND ${round.round} TOTAL</td>${roster.map((p) => `<td class="num">${totals[p]}</td>`).join('')}</tr>`;
    scoreTable = `<h3>POINTS EARNED</h3><table class="score-table"><thead>${shead}</thead><tbody>${srows}</tbody><tfoot>${foot}</tfoot></table>`;
  }

  return `<section class="panel">
    <h2>${ARROWS[round.round] || '►'} ${esc(round.name.toUpperCase())}</h2>
    <table><thead>${head}</thead><tbody>${rows}</tbody></table>
    ${scoreTable}
  </section>`;
};

const legendSection = (rules) => {
  const tiers = Object.entries(rules.basePoints)
    .map(([r, pts]) => `R${r}: BASE ${pts} PT + ${rules.gamesBonus} PT GAMES BONUS`).join(' &nbsp; • &nbsp; ');
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

export const renderYear = (year, bracket) => {
  const { upper, color } = ctx(bracket);
  const roster = rosterFor(year);
  const board = standings(year, bracket.rules, roster).map((s) => ({ ...s, upper: upper(s.person), color: color(s.person) }));
  return [
    championBanner(year, board),
    standingsSection(board, year.rounds),
    ...year.rounds.map((r) => roundSection(r, roster, upper, bracket.rules)),
    legendSection(bracket.rules),
  ].join('');
};

export const yearMarquee = (year, bracket) => {
  const board = standings(year, bracket.rules);
  const { upper } = ctx(bracket);
  const bits = [`★ BRACKET ${year.year} ★`];
  if (board[0]) bits.push(`${upper(board[0].person)} ${year.status === 'complete' ? 'WINS' : 'LEADS'} WITH ${board[0].total} PTS`);
  bits.push(year.status === 'complete' && year.champion ? `${year.champion} TAKES THE CUP` : (year.note ? 'DATA INCOMPLETE' : 'PLAYOFFS IN PROGRESS'));
  return bits.join('   ★   ') + '   ★';
};

export const leaderboardMarquee = (bracket) => {
  const board = aggregate(bracket.years, bracket.rules);
  const { upper } = ctx(bracket);
  const top = board[0];
  const bits = ['★ ALL-TIME LEADERBOARD ★'];
  if (top) bits.push(`${upper(top.person)} LEADS: ${top.championships} CUPS, ${top.roundsWon} ROUNDS, ${top.totalPoints} PTS`);
  return bits.join('   ★   ') + '   ★';
};
