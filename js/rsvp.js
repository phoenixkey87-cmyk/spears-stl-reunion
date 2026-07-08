/* =============================================
   SPEARS STL – RSVP Form Logic
   Formspree endpoint: https://formspree.io/f/mjgqdrjv
   ============================================= */

const FORMSPREE = 'https://formspree.io/f/mjgqdrjv';
const SIZES = ['XS','S','M','L','XL','2XL','3XL','Youth S','Youth M','Youth L'];

let guestCount = 1;

// ── Storage helpers ──────────────────────────
function getRSVPs() {
  return JSON.parse(localStorage.getItem('spearsRSVPs') || '[]');
}
function saveRSVPs(list) {
  localStorage.setItem('spearsRSVPs', JSON.stringify(list));
}

// ── Build a single guest row ──────────────────
function buildGuestRow(index, isFirst) {
  const label       = isFirst ? `Person 1` : `Person ${index + 1}`;
  const youTag      = isFirst ? `<span class="you-tag">You</span>` : '';
  const nameRO      = isFirst ? 'readonly' : '';
  const ph1         = isFirst ? 'Auto-filled from above' : 'First name';
  const ph2         = isFirst ? 'Auto-filled from above' : 'Last name';
  const phEmail     = isFirst ? 'Auto-filled from above' : 'Email address';
  const phPhone     = isFirst ? 'Auto-filled from above' : 'Phone number';
  const removeBtn   = isFirst ? '' : `<button type="button" class="btn-remove-guest" data-index="${index}" title="Remove">✕</button>`;

  const sizeBtns = SIZES.map(s =>
    `<button type="button" class="size-btn" data-guest="${index}" data-size="${s}">${s}</button>`
  ).join('');

  return `
    <div class="guest-row" id="guest-row-${index}" data-index="${index}">
      <div class="guest-row-header">
        <div class="guest-number-badge">${index + 1}</div>
        <strong>${label} ${youTag}</strong>
        ${removeBtn}
      </div>
      <div class="guest-name-row">
        <div class="form-group">
          <label>First Name <span class="required-star">*</span></label>
          <input type="text" id="g${index}-firstName" placeholder="${ph1}" ${nameRO} />
        </div>
        <div class="form-group">
          <label>Last Name <span class="required-star">*</span></label>
          <input type="text" id="g${index}-lastName" placeholder="${ph2}" ${nameRO} />
        </div>
      </div>
      <div class="guest-contact-row">
        <div class="form-group">
          <label>Email</label>
          <input type="email" id="g${index}-email" placeholder="${phEmail}" ${nameRO} />
        </div>
        <div class="form-group">
          <label>Phone</label>
          <input type="tel" id="g${index}-phone" placeholder="${phPhone}" ${nameRO} />
        </div>
      </div>
      <label class="tshirt-label">👕 T-Shirt Size</label>
      <div class="tshirt-sizes" id="sizes-${index}">
        ${sizeBtns}
      </div>
    </div>`;
}

// ── Re-number all rows after add/remove ───────
function renumberRows() {
  const rows = document.querySelectorAll('.guest-row');
  rows.forEach((row, i) => {
    row.dataset.index = i;
    row.id = `guest-row-${i}`;
    const badge = row.querySelector('.guest-number-badge');
    if (badge) badge.textContent = i + 1;
    const strong = row.querySelector('.guest-row-header strong');
    if (strong) {
      const youTag = i === 0 ? `<span class="you-tag">You</span>` : '';
      strong.innerHTML = `Person ${i + 1} ${youTag}`;
    }
    // Update data-guest on size buttons
    row.querySelectorAll('.size-btn').forEach(btn => btn.dataset.guest = i);
    // Update data-index on remove button
    const removeBtn = row.querySelector('.btn-remove-guest');
    if (removeBtn) removeBtn.dataset.index = i;
    // Update field IDs
    ['firstName','lastName','email','phone'].forEach(field => {
      const el = row.querySelector(`[id$="-${field}"]`);
      if (el) el.id = `g${i}-${field}`;
    });
    const sizesDiv = row.querySelector('[id^="sizes-"]');
    if (sizesDiv) sizesDiv.id = `sizes-${i}`;
  });

  guestCount = rows.length;
  document.getElementById('guestCount').value = guestCount;
  mirrorPerson1();
  attachSizeBtnListeners();
  attachRemoveBtnListeners();
}

// ── Add a new guest row ───────────────────────
function addGuestRow() {
  const container = document.getElementById('guestRows');
  const newIndex  = document.querySelectorAll('.guest-row').length;
  container.insertAdjacentHTML('beforeend', buildGuestRow(newIndex, false));
  renumberRows();
  // Scroll new row into view
  const newRow = document.getElementById(`guest-row-${newIndex}`);
  if (newRow) newRow.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// ── Remove a guest row ────────────────────────
function removeGuestRow(index) {
  const row = document.getElementById(`guest-row-${index}`);
  if (row) {
    row.style.transition = 'opacity 0.2s';
    row.style.opacity = '0';
    setTimeout(() => { row.remove(); renumberRows(); }, 200);
  }
}

// ── Attach size button listeners ──────────────
function attachSizeBtnListeners() {
  document.querySelectorAll('.size-btn').forEach(btn => {
    btn.onclick = () => {
      const gIdx = btn.dataset.guest;
      document.querySelectorAll(`.size-btn[data-guest="${gIdx}"]`).forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
    };
  });
}

// ── Attach remove button listeners ────────────
function attachRemoveBtnListeners() {
  document.querySelectorAll('.btn-remove-guest').forEach(btn => {
    btn.onclick = () => removeGuestRow(parseInt(btn.dataset.index));
  });
}

// ── Mirror Person 1 fields ────────────────────
function mirrorPerson1() {
  const map = {
    firstName: 'g0-firstName',
    lastName:  'g0-lastName',
    email:     'g0-email',
    phone:     'g0-phone'
  };
  Object.entries(map).forEach(([srcId, destId]) => {
    const src  = document.getElementById(srcId);
    const dest = document.getElementById(destId);
    if (src && dest) {
      dest.value = src.value;
      // Only add listener once
      if (!src.dataset.mirrorBound) {
        src.addEventListener('input', () => {
          const d = document.getElementById(destId);
          if (d) d.value = src.value;
        });
        src.dataset.mirrorBound = 'true';
      }
    }
  });
}

// ── Collect all guest data ────────────────────
function collectGuests() {
  const rows   = document.querySelectorAll('.guest-row');
  const guests = [];
  rows.forEach((row, i) => {
    const firstName = (document.getElementById(`g${i}-firstName`)?.value || '').trim();
    const lastName  = (document.getElementById(`g${i}-lastName`)?.value  || '').trim();
    const email     = (document.getElementById(`g${i}-email`)?.value     || '').trim();
    const phone     = (document.getElementById(`g${i}-phone`)?.value     || '').trim();
    const sizeBtn   = row.querySelector(`.size-btn.selected`);
    const tshirt    = sizeBtn ? sizeBtn.dataset.size : 'Not selected';
    guests.push({ firstName, lastName, email, phone, tshirt });
  });
  return guests;
}

// ── Validation ────────────────────────────────
function validate(form) {
  let valid = true;
  const clear = id => { const el = document.getElementById(id); if (el) el.textContent = ''; };
  const err   = (id, msg) => { const el = document.getElementById(id); if (el) { el.textContent = msg; valid = false; } };
  const val   = id => (document.getElementById(id)?.value || '').trim();

  clear('err-firstName'); clear('err-lastName'); clear('err-branch'); clear('err-attending');

  if (!val('firstName')) err('err-firstName', 'First name is required.');
  if (!val('lastName'))  err('err-lastName',  'Last name is required.');
  if (!val('branch'))    err('err-branch',    'Please select your family branch.');

  const attending = form.querySelector('input[name="attending"]:checked');
  if (!attending)  err('err-attending', 'Please select your attendance status.');

  return valid;
}

// ── RSVP counter sidebar ──────────────────────
function updateCounter() {
  const rsvps  = getRSVPs();
  const total  = rsvps.reduce((sum, r) => sum + (r.guestCount || 1), 0);
  const goal   = 100;
  const pct    = Math.min((total / goal) * 100, 100);
  const el     = document.getElementById('rsvpCount');
  const bar    = document.getElementById('counterBar');
  const lbl    = document.getElementById('counterLabel');
  if (el)  el.textContent  = total;
  if (bar) bar.style.width = pct + '%';
  if (lbl) lbl.textContent = total === 0 ? 'Be the first to RSVP!' : `${total} guest${total !== 1 ? 's' : ''} and counting!`;
}

// ── Format guests for Formspree ───────────────
function formatGuestsForFormspree(guests) {
  return guests.map((g, i) =>
    `Person ${i + 1}: ${g.firstName} ${g.lastName} | Email: ${g.email || 'N/A'} | Phone: ${g.phone || 'N/A'} | T-Shirt: ${g.tshirt}`
  ).join('\n');
}

// ── Init ──────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const form          = document.getElementById('rsvpForm');
  const addGuestBtn   = document.getElementById('addGuestBtn');
  const sizeGuideBtn  = document.getElementById('sizeGuideToggle');
  const sizeGuideDiv  = document.getElementById('sizeGuideTable');
  const successBanner = document.getElementById('successBanner');

  // Build initial Person 1 row
  document.getElementById('guestRows').innerHTML = buildGuestRow(0, true);
  mirrorPerson1();
  attachSizeBtnListeners();
  updateCounter();

  // Add guest button
  addGuestBtn.addEventListener('click', addGuestRow);

  // Size guide toggle
  sizeGuideBtn.addEventListener('click', () => {
    const isHidden = sizeGuideDiv.style.display === 'none';
    sizeGuideDiv.style.display = isHidden ? 'block' : 'none';
    sizeGuideBtn.textContent   = isHidden ? '📏 Hide Size Guide' : '📏 View Size Guide';
  });

  // Form submit → Formspree
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!validate(form)) return;

    const submitBtn  = document.getElementById('submitBtn');
    const submitText = document.getElementById('submitText');
    const spinner    = document.getElementById('submitSpinner');

    submitBtn.disabled       = true;
    submitText.style.display = 'none';
    spinner.style.display    = 'inline';

    const attending  = form.querySelector('input[name="attending"]:checked')?.value || '';
    const guests     = collectGuests();
    const guestBlock = formatGuestsForFormspree(guests);

    const payload = {
      firstName:   document.getElementById('firstName').value.trim(),
      lastName:    document.getElementById('lastName').value.trim(),
      email:       document.getElementById('email').value.trim(),
      phone:       document.getElementById('phone').value.trim(),
      branch:      document.getElementById('branch').value,
      attending,
      guestCount,
      guests:      guestBlock,
      dietary:     document.getElementById('dietary').value.trim(),
      submittedAt: new Date().toLocaleString()
    };

    try {
      const res = await fetch(FORMSPREE, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body:    JSON.stringify(payload)
      });

      if (res.ok) {
        // Save to localStorage for tracker
        const rsvps = getRSVPs();
        rsvps.push({ ...payload, guests, id: Date.now() });
        saveRSVPs(rsvps);

        successBanner.style.display = 'block';
        successBanner.scrollIntoView({ behavior: 'smooth' });
        form.reset();
        guestCount = 1;
        document.getElementById('guestCount').value = 1;
        document.getElementById('guestRows').innerHTML = buildGuestRow(0, true);
        mirrorPerson1();
        attachSizeBtnListeners();
        updateCounter();
      } else {
        const data = await res.json();
        alert('Something went wrong: ' + (data?.errors?.[0]?.message || 'Please try again.'));
      }
    } catch (err) {
      alert('Network error. Please check your connection and try again.');
    } finally {
      submitBtn.disabled       = false;
      submitText.style.display = 'inline';
      spinner.style.display    = 'none';
    }
  });
});
