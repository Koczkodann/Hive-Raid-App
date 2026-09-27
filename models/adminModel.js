const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const DATA_PATH = path.join(__dirname, '..', 'data', 'admin.json');
const SALT_ROUNDS = 10;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Read admin data from disk. */
function _read() {
  try {
    const raw = fs.readFileSync(DATA_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

/** Persist admin data to disk. */
function _write(data) {
  fs.mkdirSync(path.dirname(DATA_PATH), { recursive: true });
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/** Check whether an admin password has been configured. */
function isSetUp() {
  const data = _read();
  return Boolean(data.passwordHash);
}

/** Hash and store the admin password. */
async function setPassword(plaintext) {
  const data = _read();
  data.passwordHash = await bcrypt.hash(plaintext, SALT_ROUNDS);
  _write(data);
}

/** Verify a plaintext password against the stored hash. */
async function verifyPassword(plaintext) {
  const data = _read();
  if (!data.passwordHash) return false;
  return bcrypt.compare(plaintext, data.passwordHash);
}

module.exports = { isSetUp, setPassword, verifyPassword };
