/* =============================================
   SPEARS STL – RSVP Form Logic
   Formspree endpoint: https://formspree.io/f/mjgqdrjv
   ============================================= */

const FORMSPREE = 'https://formspree.io/f/mjgqdrjv';
const SIZES = ['XS','S','M','L','XL','2XL','3XL','Youth S','Youth M','Youth L'];

// ── Storage helpers ──────────────────────────
function getRSVPs() {
  return JSON.parse(localStorage.getItem('spearsRSVPs') || '[]');
}
function saveRSVPs(list) {
  localStorage.setItem('spearsRSVPs', JSON.stringify(list));
}

// ── Guest row builder ─────────────────────────
function buildGuestRow(index, isFirst) {
  const label = isFirst ? `Person ${index + 1} <span class="you-tag">You</span>` : `Person ${index + 1}`;
  const nameReadonly = isFirst ? 'readonly' : '';
  const contactReadonly = isFirst ? 'readonly' : '';
  const namePlaceholder1 = isFirst ? 'Auto-filled from above' : 'First name';
  const namePlaceholder2 = isFirst ? 'Auto-filled from above' : 'Last name';
  const emailPlaceholder = isFirst ? 'Auto-filled from above' : 'Email address';
  const phonePlaceholder = isFirst ? 'Auto-filled from above' : 'Phone number';

  const sizeBtns = SIZES.map(s =>
    `<button type="button" class="size-btn" data-guest="${index}" data-size="${s}">${s}</button>`
  ).join('');

  return `
    <div class="guest-row" id="guest-row-${index}">
      <div class="guest-row-header">
        <div class="guest-number-badge">${index + 1}</div>
        <strong>${label}</strong>
      </div>
      <div class="guest-name-row">
        <div class="form-group">
          <label>First Name <span class="required-star">*</span></label>
          <input type="text" id="g${index}-firstName" placeholder="${namePlaceholder1}" ${nameReadonly} />
        </div>
        <div class="form-group">
          <label>Last Name <span class="required-star">*</span></label>
          <input type="text" id="g${index}-lastName" placeholder="${namePlaceholder2}" ${nameReadonly} />
        </div>
      </div>
      <div class="guest-contact-row">
        <div class="form-group">
          <label>Email</label>
          <input type="email" id="g${index}-email" placeholder="${emailPlaceholder}" ${contactReadonly} />
        </div>
        <div class="form-group">
          <label>Phone</label>
          <input type="tel" id="g${index}-phone" placeholder="${phonePlaceholder}" ${contactReadonly} />
        </div>
      </div>
      <label class="tshirt-label">👕 T-Shirt Size</label>
      <div class="tshirt-sizes" id="sizes-${index}">
        ${sizeBtns}
      </div>
    </div>`;
}

// ── Render all guest rows ─────────────────────
function renderGuestRows(count) {
  const container = document.getElementById('guestRows');
  container.innerHTML = '';
  for (let i = 0; i < count; i++) {
    container.insertAdjacentHTML('beforeend', buildGuestRow(i, i === 0));
  }
  // Re-attach size button listeners
  document.querySelectorAll('.size-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const gIdx = btn.dataset.guest;
      document.querySelectorAll(`.size-btn[data-guest="${gIdx}"]`).forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
    });
  });
  // Mirror Person 1 fields from top-level inputs
  mirrorPerson1();
}

// ── Mirror top inputs into Person 1 row ───────
function mirrorPerson1() {
  const map = { firstName: 'g0-firstName', lastName: 'g0-lastName', email: 'g0-email', phone: 'g0-phone' };
  Object.entries(map).forEach(([srcId, destId]) => {
    const src = document.getElementById(srcId);
    const dest = document.getElementById(destId);
    if (src && dest) {
      dest.value = src.value;
      src.addEventListener('input', () => { dest.value = src.value; });
    }
  });
}

// ── Collect guest data ────────────────────────
function collectGuests(count) {
  const guests = [];
  for (let i = 0; i < count; i++) {
    const firstName = (document.getElementById(`g${i}-firstName`)?.value || '').trim();
    const lastName  = (document.getElementById(`g${i}-lastName`)?.value  || '').trim();
    const email     = (document.getElementById(`g${i}-email`)?.value     || '').trim();
    const phone     = (document.getElementById(`g${i}-phone`)?.value     || '').trim();
    const sizeBtn   = document.querySelector(`.size-btn.selected[data-guest="${i}"]`);
    const tshirt    = sizeBtn ? sizeBtn.dataset.size : 'Not selected';
    guests.push({ firstName, lastName, email, phone, tshirt });
  }
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
  if (!attending) err('err-attending', 'Please select your attendance status.');

  return valid;
}

// ── Update RSVP counter sidebar ───────────────
function updateCounter() {
  const rsvps  = getRSVPs();
  const total  = rsvps.reduce((sum, r) => sum + (r.guestCount || 1), 0);
  const goal   = 100;
  const pct    = Math.min((total / goal) * 100, 100);

  const countEl = document.getElementById('rsvpCount');
  const barEl   = document.getElementById('counterBar');
  const labelEl = document.getElementById('counterLabel');

  if (countEl) countEl.textContent = total;
  if (barEl)   barEl.style.width   = pct + '%';
  if (labelEl) {
    labelEl.textContent = total === 0
      ? 'Be the first to RSVP!'
      : `${total} guest${total !== 1 ? 's' : ''} and counting!`;
  }
}

// ── Format guests for Formspree ───────────────
function formatGuestsForFormspree(guests) {
  return guests.map((g, i) =>
    `Person ${i + 1}: ${g.firstName} ${g.lastName} | Email: ${g.email || 'N/A'} | Phone: ${g.phone || 'N/A'} | T-Shirt: ${g.tshirt}`
  ).join('\n');
}

// ── Main init ─────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const form          = document.getElementById('rsvpForm');
  const guestCountEl  = document.getElementById('guestCount');
  const increaseBtn   = document.getElementById('increaseGuests');
  const decreaseBtn   = document.getElementById('decreaseGuests');
  const sizeGuideBtn  = document.getElementById('sizeGuideToggle');
  const sizeGuideDiv  = document.getElementById('sizeGuideTable');
  const successBanner = document.getElementById('successBanner');

  let guestCount = 1;
  renderGuestRows(guestCount);
  updateCounter();

  // Guest count stepper
  increaseBtn.addEventListener('click', () => {
    if (guestCount < 20) {
      guestCount++;
      guestCountEl.value = guestCount;
      renderGuestRows(guestCount);
    }
  });

  decreaseBtn.addEventListener('click', () => {
    if (guestCount > 1) {
      guestCount--;
      guestCountEl.value = guestCount;
      renderGuestRows(guestCount);
    }
  });

  // Size guide toggle
  sizeGuideBtn.addEventListener('click', () => {
    const isHidden = sizeGuideDiv.style.display === 'none';
    sizeGuideDiv.style.display = isHidden ? 'block' : 'none';
    sizeGuideBtn.textContent = isHidden ? '📏 Hide Size Guide' : '📏 View Size Guide';
  });

  // Form submit → Formspree
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!validate(form)) return;

    const submitBtn  = document.getElementById('submitBtn');
    const submitText = document.getElementById('submitText');
    const spinner    = document.getElementById('submitSpinner');

    submitBtn.disabled    = true;
    submitText.style.display = 'none';
    spinner.style.display    = 'inline';

    const attending  = form.querySelector('input[name="attending"]:checked')?.value || '';
    const guests     = collectGuests(guestCount);
    const guestBlock = formatGuestsForFormspree(guests);

    // Build flat payload for Formspree
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
      heardFrom:   document.getElementById('heardFrom').value,
      submittedAt: new Date().toLocaleString()
    };

    try {
      const res = await fetch(FORMSPREE, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body:    JSON.stringify(payload)
      });

      if (res.ok) {
        // Also save to localStorage for the tracker page
        const rsvps = getRSVPs();
        rsvps.push({ ...payload, guests, id: Date.now() });
        saveRSVPs(rsvps);

        // Show success
        successBanner.style.display = 'block';
        successBanner.scrollIntoView({ behavior: 'smooth' });
        form.reset();
        guestCount = 1;
        guestCountEl.value = 1;
        renderGuestRows(1);
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
