/**
 * Hive Raid App — client-side helpers.
 *
 * Handles:
 * - Timezone conversion: UTC ↔ local time
 * - European date formatting (DD/MM/YYYY, 24h)
 * - Confirmation dialogs for destructive actions
 * - Flash messages from query params
 */
document.addEventListener('DOMContentLoaded', () => {

  // ── Timezone: format all <time class="local-datetime"> to visitor's local ──
  formatLocalDatetimes();

  // ── Timezone: convert admin datetime-local to UTC on submit ──
  setupAdminDatetimeForm();

  // ── Confirmation dialogs ──
  document.querySelectorAll('[data-confirm]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const message = btn.getAttribute('data-confirm');
      if (!confirm(message)) {
        e.preventDefault();
      }
    });
  });

  // ── Flash messages from query params ──
  showFlashMessages();

  // ── Character name 30-character limit feedback ──
  setupCharacterNameLimit();
});

// ---------------------------------------------------------------------------
// Timezone & Date Formatting
// ---------------------------------------------------------------------------

/**
 * Format a Date object as European format: DD/MM/YYYY, HH:mm
 * Uses the visitor's local timezone automatically.
 */
function formatEuropeanDate(date) {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  // Detect timezone abbreviation for display
  const tzName = Intl.DateTimeFormat('en', { timeZoneName: 'short' })
    .formatToParts(date)
    .find((p) => p.type === 'timeZoneName');
  const tz = tzName ? ` ${tzName.value}` : '';

  return `${day}/${month}/${year}, ${hours}:${minutes}${tz}`;
}

/**
 * Find all <time class="local-datetime"> elements and replace their
 * text content with the European-formatted local time.
 */
function formatLocalDatetimes() {
  document.querySelectorAll('time.local-datetime').forEach((el) => {
    const utc = el.getAttribute('datetime');
    if (!utc) return;
    const date = new Date(utc);
    if (isNaN(date.getTime())) return;
    el.textContent = formatEuropeanDate(date);
  });
}

/**
 * Intercept the admin "create event" form submission.
 * Converts the datetime-local value (admin's local time) to a UTC ISO string
 * and puts it in the hidden field before the form actually submits.
 */
function setupAdminDatetimeForm() {
  const form = document.getElementById('create-event-form');
  if (!form) return;

  const localInput = document.getElementById('localDatetime');
  const utcHidden = document.getElementById('datetime-utc');

  form.addEventListener('submit', (e) => {
    // Skip if we already converted (prevents infinite loop)
    if (utcHidden.value) return;

    e.preventDefault();

    if (!localInput.value) return;

    // datetime-local gives "YYYY-MM-DDTHH:mm" — browser interprets as local time
    const localDate = new Date(localInput.value);
    utcHidden.value = localDate.toISOString();

    // Now submit for real
    form.submit();
  });
}

// ---------------------------------------------------------------------------
// Flash Messages & UI Feedback
// ---------------------------------------------------------------------------

function displayFlash(message, type = 'error') {
  const existing = document.querySelector('.flash');
  if (existing) existing.remove();

  const flash = document.createElement('div');
  flash.className = `flash flash--${type}`;
  flash.textContent = message;

  Object.assign(flash.style, {
    position: 'fixed',
    top: '70px',
    right: '1.5rem',
    padding: '0.75rem 1.25rem',
    borderRadius: '8px',
    fontWeight: '600',
    zIndex: '200',
    background: type === 'error' ? '#e74c3c' : '#2ecc71',
    color: '#fff',
    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
    animation: 'fadeIn 0.3s ease',
  });

  document.body.appendChild(flash);

  setTimeout(() => {
    flash.style.opacity = '0';
    flash.style.transition = 'opacity 0.4s';
    setTimeout(() => flash.remove(), 400);
  }, 3000);
}

function showFlashMessages() {
  const params = new URLSearchParams(window.location.search);
  const error = params.get('error');
  const success = params.get('success');

  if (error || success) {
    displayFlash(error || success, error ? 'error' : 'success');
    window.history.replaceState({}, '', window.location.pathname);
  }
}

/**
 * Limit character name to 30 characters without mentioning it upfront.
 * Alerts the user with a flash message if they attempt to type or paste more.
 */
function setupCharacterNameLimit() {
  const nameInput = document.getElementById('name');
  if (!nameInput) return;

  nameInput.addEventListener('input', () => {
    if (nameInput.value.length > 30) {
      nameInput.value = nameInput.value.slice(0, 30);
      displayFlash('Character name cannot exceed 30 characters', 'error');
    }
  });

  nameInput.addEventListener('keydown', (e) => {
    if (nameInput.value.length >= 30 && e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
      const hasSelection = nameInput.selectionStart !== nameInput.selectionEnd;
      if (!hasSelection) {
        displayFlash('Character name cannot exceed 30 characters', 'error');
      }
    }
  });
}
