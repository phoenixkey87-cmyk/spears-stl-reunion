/* =============================================
   SPEARS STL – Admin / Guest Tracker Logic
   ============================================= */

const BRANCH_COLORS = [
  '#e63946','#f4a261','#43aa8b','#4361ee','#7b2d8b','#0096c7'
];

function getRSVPs() {
  return JSON.parse(localStorage.getItem('spearsRSVPs') || '[]');
}
function saveRSVPs(list) {
  localStorage.setItem('spearsRSVPs', JSON.stringify(list));
}

// ── Stats ─────────────────────────────────────
function renderStats(rsvps) {
  const yes     = rsvps.filter(r => r.attending === 'Yes').length;
  const maybe   = rsvps.filter(r => r.attending === 'Maybe').length;
  const no      = rsvps.filter(r => r.attending === 'No').length;
  const guests  = rsvps.reduce((s, r) => s + Number(r.guestCount || 1), 0);
  const shirts  = rsvps.reduce((s, r) => s + (r.guests || []).filter(g => g.tshirt && g.tshirt !== 'Not selected').length, 0);

  document.getElementById('statTotal').textContent  = rsvps.length;
  document.getElementById('statYes').textContent    = yes;
  document.getElementById('statMaybe').textContent  = maybe;
  document.getElementById('statNo').textContent     = no;
  document.getElementById('statGuests').textContent = guests;
  document.getElementById('statShirts').textContent = shirts;
}

// ── T-shirt summary pills ─────────────────────
function renderTshirtSummary(rsvps) {
  const counts = {};
  rsvps.forEach(r => {
    (r.guests || []).forEach(g => {
      if (g.tshirt && g.tshirt !== 'Not selected') {
        counts[g.tshirt] = (counts[g.tshirt] || 0) + 1;
      }
    });
  });

  const container = document.getElementById('tshirtSummary');
  const order = ['XS','S','M','L','XL','2XL','3XL','Youth S','Youth M','Youth L'];
  const keys  = order.filter(k => counts[k]);

  if (!keys.length) {
    container.innerHTML = '<p class="no-data-text">No t-shirt orders yet.</p>';
    return;
  }

  container.innerHTML = keys.map(size =>
    `<div class="shirt-pill">
       <span class="size-label">${size}</span>
       <span class="size-count">${counts[size]}</span>
     </div>`
  ).join('');
}

// ── Branch breakdown bars ─────────────────────
function renderBranchBreakdown(rsvps) {
  const counts = {};
  rsvps.forEach(r => {
    const b = r.branch || 'Unknown';
    counts[b] = (counts[b] || 0) + Number(r.guestCount || 1);
  });

  const grid  = document.getElementById('branchGrid');
  const keys  = Object.keys(counts);
  if (!keys.length) {
    grid.innerHTML = '<p class="no-data-text">No data yet.</p>';
    return;
  }

  const max = Math.max(...Object.values(counts));
  grid.innerHTML = keys.map((branch, i) => {
    const pct   = Math.round((counts[branch] / max) * 100);
    const color = BRANCH_COLORS[i % BRANCH_COLORS.length];
    return `
      <div class="branch-row">
        <span class="branch-name">${branch}</span>
        <div class="branch-bar-wrap">
          <div class="branch-bar" style="width:${pct}%; background:${color};"></div>
        </div>
        <span class="branch-count">${counts[branch]}</span>
      </div>`;
  }).join('');
}

// ── Format guests for table cell ─────────────
function formatGuestsCell(guests) {
  if (!guests || !guests.length) return '—';
  return guests.map(g => {
    const name  = `${g.firstName || ''} ${g.lastName || ''}`.trim() || 'Unknown';
    const shirt = g.tshirt && g.tshirt !== 'Not selected' ? ` (${g.tshirt})` : '';
    const email = g.email ? `<br/><small style="color:#888">${g.email}</small>` : '';
    const phone = g.phone ? `<br/><small style="color:#888">${g.phone}</small>` : '';
    return `<div style="margin-bottom:4px">${name}${shirt}${email}${phone}</div>`;
  }).join('');
}

// ── Render table ──────────────────────────────
let pendingDeleteId = null;
let pendingEditId   = null;

function renderTable(rsvps) {
  const emptyState     = document.getElementById('emptyState');
  const tableContainer = document.getElementById('tableContainer');
  const tbody          = document.getElementById('guestTableBody');
  const resultCount    = document.getElementById('resultCount');

  if (!rsvps.length) {
    emptyState.style.display     = 'block';
    tableContainer.style.display = 'none';
    resultCount.textContent      = '';
    return;
  }

  emptyState.style.display     = 'none';
  tableContainer.style.display = 'block';
  resultCount.textContent      = `(${rsvps.length})`;

  tbody.innerHTML = rsvps.map((r, i) => {
    const name     = `${r.firstName} ${r.lastName}`;
    const badgeCls = r.attending === 'Yes' ? 'badge-yes' : r.attending === 'Maybe' ? 'badge-maybe' : 'badge-no';
    const date     = r.submittedAt || '—';
    const notes    = r.dietary || '—';

    return `
      <tr>
        <td>${i + 1}</td>
        <td class="td-name">${name}</td>
        <td>${r.branch || '—'}</td>
        <td><span class="status-badge ${badgeCls}">${r.attending}</span></td>
        <td style="text-align:center">${r.guestCount || 1}</td>
        <td class="td-shirts">${formatGuestsCell(r.guests)}</td>
        <td>${r.phone || '—'}</td>
        <td>${r.email || '—'}</td>
        <td class="td-notes" title="${notes}">${notes}</td>
        <td class="td-date">${date}</td>
        <td>
          <div class="action-btns">
            <button class="action-btn btn-edit"   data-id="${r.id}">✏️ Edit</button>
            <button class="action-btn btn-delete" data-id="${r.id}" data-name="${name}">🗑️</button>
          </div>
        </td>
      </tr>`;
  }).join('');

  // Edit listeners
  document.querySelectorAll('.action-btn.btn-edit').forEach(btn => {
    btn.addEventListener('click', () => {
      const rsvps = getRSVPs();
      const entry = rsvps.find(r => String(r.id) === btn.dataset.id);
      if (!entry) return;
      pendingEditId = entry.id;
      document.getElementById('editAttending').value = entry.attending;
      document.getElementById('editNotes').value     = entry.dietary || '';
      document.getElementById('editModal').style.display = 'flex';
    });
  });

  // Delete listeners
  document.querySelectorAll('.action-btn.btn-delete').forEach(btn => {
    btn.addEventListener('click', () => {
      pendingDeleteId = btn.dataset.id;
      document.getElementById('deleteGuestName').textContent = btn.dataset.name;
      document.getElementById('deleteModal').style.display = 'flex';
    });
  });
}

// ── Filter / search / sort ────────────────────
function getFiltered() {
  let list   = getRSVPs();
  const q    = document.getElementById('searchInput').value.toLowerCase();
  const att  = document.getElementById('filterAttending').value;
  const br   = document.getElementById('filterBranch').value;
  const sort = document.getElementById('sortBy').value;

  if (q)   list = list.filter(r => `${r.firstName} ${r.lastName} ${r.branch} ${r.attending}`.toLowerCase().includes(q));
  if (att) list = list.filter(r => r.attending === att);
  if (br)  list = list.filter(r => r.branch    === br);

  if (sort === 'oldest') list.sort((a, b) => a.id - b.id);
  else if (sort === 'newest') list.sort((a, b) => b.id - a.id);
  else if (sort === 'name')   list.sort((a, b) => `${a.firstName}${a.lastName}`.localeCompare(`${b.firstName}${b.lastName}`));
  else if (sort === 'branch') list.sort((a, b) => (a.branch || '').localeCompare(b.branch || ''));

  return list;
}

function refresh() {
  const all      = getRSVPs();
  const filtered = getFiltered();
  renderStats(all);
  renderTshirtSummary(all);
  renderBranchBreakdown(all);
  renderTable(filtered);
}

// ── CSV export ────────────────────────────────
function exportCSV() {
  const rsvps = getRSVPs();
  if (!rsvps.length) { alert('No data to export yet.'); return; }

  const headers = ['#','First Name','Last Name','Email','Phone','Branch','Attending','Guest Count','Guest Details','Dietary Notes','Heard From','Submitted'];
  const rows = rsvps.map((r, i) => {
    const guestDetail = (r.guests || []).map(g =>
      `${g.firstName} ${g.lastName} | ${g.email || ''} | ${g.phone || ''} | Shirt: ${g.tshirt}`
    ).join(' / ');
    return [
      i + 1,
      r.firstName, r.lastName, r.email, r.phone,
      r.branch, r.attending, r.guestCount,
      `"${guestDetail.replace(/"/g, '""')}"`,
      `"${(r.dietary || '').replace(/"/g, '""')}"`,
      r.heardFrom, r.submittedAt
    ].join(',');
  });

  const csv  = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = 'spears-stl-rsvps.csv';
  a.click();
  URL.revokeObjectURL(url);
}

// ── Init ──────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  refresh();

  document.getElementById('searchInput').addEventListener('input', refresh);
  document.getElementById('filterAttending').addEventListener('change', refresh);
  document.getElementById('filterBranch').addEventListener('change', refresh);
  document.getElementById('sortBy').addEventListener('change', refresh);
  document.getElementById('exportCsvBtn').addEventListener('click', exportCSV);

  // Clear all
  document.getElementById('clearAllBtn').addEventListener('click', () => {
    document.getElementById('clearModal').style.display = 'flex';
  });
  document.getElementById('cancelClear').addEventListener('click', () => {
    document.getElementById('clearModal').style.display = 'none';
  });
  document.getElementById('confirmClear').addEventListener('click', () => {
    localStorage.removeItem('spearsRSVPs');
    document.getElementById('clearModal').style.display = 'none';
    refresh();
  });

  // Delete
  document.getElementById('cancelDelete').addEventListener('click', () => {
    document.getElementById('deleteModal').style.display = 'none';
    pendingDeleteId = null;
  });
  document.getElementById('confirmDelete').addEventListener('click', () => {
    if (!pendingDeleteId) return;
    const updated = getRSVPs().filter(r => String(r.id) !== String(pendingDeleteId));
    saveRSVPs(updated);
    pendingDeleteId = null;
    document.getElementById('deleteModal').style.display = 'none';
    refresh();
  });

  // Edit
  document.getElementById('cancelEdit').addEventListener('click', () => {
    document.getElementById('editModal').style.display = 'none';
    pendingEditId = null;
  });
  document.getElementById('confirmEdit').addEventListener('click', () => {
    if (!pendingEditId) return;
    const rsvps   = getRSVPs();
    const entry   = rsvps.find(r => String(r.id) === String(pendingEditId));
    if (entry) {
      entry.attending = document.getElementById('editAttending').value;
      entry.dietary   = document.getElementById('editNotes').value;
      saveRSVPs(rsvps);
    }
    pendingEditId = null;
    document.getElementById('editModal').style.display = 'none';
    refresh();
  });
});
