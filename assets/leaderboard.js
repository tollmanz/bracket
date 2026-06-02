// Progressive enhancement: click a leaderboard column header to re-sort.
// The table is fully rendered server-side (default: championships, descending), so this
// only adds interactivity. Numeric sort keys live in each cell's data-sort attribute.
// Optional shareable state via ?sort=KEY&dir=asc|desc.
(() => {
  const table = document.getElementById('leaderboard');
  if (!table) return;
  const tbody = table.tBodies[0];
  const ORDINAL = ['', '1ST', '2ND', '3RD', '4TH', '5TH', '6TH', '7TH', '8TH', '9TH', '10TH', '11TH', '12TH'];

  const cellValue = (row, key, type) => {
    const cell = row.querySelector('.col-' + key);
    const raw = cell ? cell.getAttribute('data-sort') : '';
    return type === 'num' ? Number(raw) : String(raw);
  };

  const sortBy = (key, type, dir) => {
    const rows = [...tbody.rows];
    const factor = dir === 'asc' ? 1 : -1;
    rows.sort((a, b) => {
      const av = cellValue(a, key, type);
      const bv = cellValue(b, key, type);
      const cmp = type === 'num' ? av - bv : av.localeCompare(bv);
      return cmp * factor;
    });
    rows.forEach((row, i) => {
      const rank = i + 1;
      row.cells[0].textContent = ORDINAL[rank] || rank + 'TH';
      row.classList.remove('rank-1', 'rank-2', 'rank-3');
      if (rank <= 3) row.classList.add('rank-' + rank);
      tbody.appendChild(row);
    });
    // Header indicators + aria-sort.
    table.querySelectorAll('th[aria-sort]').forEach((th) => th.removeAttribute('aria-sort'));
    table.querySelectorAll('.sort-ind').forEach((s) => (s.textContent = ''));
    const btn = table.querySelector(`.th-sort[data-key="${key}"]`);
    if (btn) {
      btn.closest('th').setAttribute('aria-sort', dir === 'asc' ? 'ascending' : 'descending');
      btn.querySelector('.sort-ind').textContent = dir === 'asc' ? '▲' : '▼';
    }
  };

  let current = { key: 'cups', dir: 'desc' };

  table.querySelectorAll('.th-sort').forEach((btn) => {
    btn.addEventListener('click', () => {
      const key = btn.dataset.key;
      const type = btn.dataset.type;
      // Same column toggles direction; new column starts desc for numbers, asc for text.
      const dir = current.key === key
        ? (current.dir === 'asc' ? 'desc' : 'asc')
        : (type === 'num' ? 'desc' : 'asc');
      current = { key, dir };
      sortBy(key, type, dir);
      const url = new URL(location);
      url.searchParams.set('sort', key);
      url.searchParams.set('dir', dir);
      history.replaceState(null, '', url);
    });
  });

  // Apply initial sort from the URL, if any.
  const params = new URLSearchParams(location.search);
  const key = params.get('sort');
  if (key) {
    const btn = table.querySelector(`.th-sort[data-key="${key}"]`);
    if (btn) {
      const dir = params.get('dir') === 'asc' ? 'asc' : 'desc';
      current = { key, dir };
      sortBy(key, btn.dataset.type, dir);
    }
  }
})();
