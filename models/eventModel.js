const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DATA_PATH = path.join(__dirname, '..', 'data', 'events.json');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Read the events array from disk. */
function _readAll() {
  try {
    const raw = fs.readFileSync(DATA_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

/** Persist the events array to disk. */
function _writeAll(events) {
  fs.mkdirSync(path.dirname(DATA_PATH), { recursive: true });
  fs.writeFileSync(DATA_PATH, JSON.stringify(events, null, 2), 'utf-8');
}

/** Generate a short unique id. */
function _generateId() {
  return crypto.randomBytes(8).toString('hex');
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/** Return every event, sorted by date ascending. */
function getAll() {
  const events = _readAll();
  events.sort((a, b) => new Date(a.datetime) - new Date(b.datetime));
  return events;
}

/** Return a single event by id, or null. */
function getById(id) {
  return _readAll().find((e) => e.id === id) || null;
}

/** Create a new event and return it. */
function create({ name, datetime, description }) {
  const events = _readAll();
  const event = {
    id: _generateId(),
    name,
    datetime,
    description: description || '',
    createdAt: new Date().toISOString(),
    roster: [],
  };
  events.push(event);
  _writeAll(events);
  return event;
}

/** Delete an event by id. Returns true if found & deleted. */
function remove(id) {
  const events = _readAll();
  const idx = events.findIndex((e) => e.id === id);
  if (idx === -1) return false;
  events.splice(idx, 1);
  _writeAll(events);
  return true;
}

/** Add a member to an event's roster. Returns the new member object. */
function addMember(eventId, { name, role }) {
  const events = _readAll();
  const event = events.find((e) => e.id === eventId);
  if (!event) return null;

  const member = {
    id: _generateId(),
    name,
    role,
    enrolledAt: new Date().toISOString(),
  };
  event.roster.push(member);
  _writeAll(events);
  return member;
}

/** Remove a member from an event's roster. Returns true if found & removed. */
function removeMember(eventId, memberId) {
  const events = _readAll();
  const event = events.find((e) => e.id === eventId);
  if (!event) return false;

  const idx = event.roster.findIndex((m) => m.id === memberId);
  if (idx === -1) return false;

  event.roster.splice(idx, 1);
  _writeAll(events);
  return true;
}

module.exports = { getAll, getById, create, remove, addMember, removeMember };
