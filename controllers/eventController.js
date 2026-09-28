const EventModel = require('../models/eventModel');
const {
  ROLE_CATEGORIES,
  ALL_JOBS,
  ROLE_LIMITS,
  RESERVE_LIMITS,
  getBroadRole,
  partitionRoster,
} = require('../config/roles');

/**
 * GET / — render the main events listing page.
 */
function listEvents(req, res) {
  const events = EventModel.getAll().map((event) => ({
    ...event,
    partitioned: partitionRoster(event.roster),
  }));
  res.render('index', { title: 'Upcoming Raids', events });
}

/**
 * GET /events/:id — render a single event with its roster and enroll form.
 */
function showEvent(req, res) {
  const event = EventModel.getById(req.params.id);
  if (!event) return res.status(404).render('404', { title: 'Raid Not Found' });

  const partitioned = partitionRoster(event.roster);

  res.render('event', {
    title: event.name,
    event,
    partitioned,
    roleCategories: ROLE_CATEGORIES,
    getBroadRole,
  });
}

/**
 * POST /events/:id/enroll — add a member to the event roster.
 */
function enrollMember(req, res) {
  const { name, role } = req.body;
  const eventId = req.params.id;

  // Basic validation
  const trimmedName = name ? name.trim().replace(/[\r\n\t]+/g, ' ') : '';
  if (!trimmedName) {
    return res.redirect(`/events/${eventId}?error=${encodeURIComponent('Name is required')}`);
  }
  if (trimmedName.length > 30) {
    return res.redirect(`/events/${eventId}?error=${encodeURIComponent('Character name cannot exceed 30 characters')}`);
  }
  if (!ALL_JOBS.includes(role)) {
    return res.redirect(`/events/${eventId}?error=${encodeURIComponent('Invalid role selected')}`);
  }

  const event = EventModel.getById(eventId);
  if (!event) {
    return res.status(404).render('404', { title: 'Raid Not Found' });
  }

  const broadRole = getBroadRole(role);
  const partitioned = partitionRoster(event.roster);
  const maxMain = ROLE_LIMITS[broadRole] || 2;
  const maxReserve = RESERVE_LIMITS[broadRole] || 4;

  if (partitioned.counts[broadRole] >= maxMain && (partitioned.reserveCounts[broadRole] || 0) >= maxReserve) {
    return res.redirect(`/events/${eventId}?error=${encodeURIComponent(`Cannot join: ${broadRole} slots are completely full (max 2 main + 4 reserves)`)}`);
  }

  EventModel.addMember(eventId, { name: trimmedName, role });
  res.redirect(`/events/${eventId}?success=${encodeURIComponent('Joined raid successfully!')}`);
}

/**
 * POST /events/:id/unenroll/:memberId — remove a member from the roster.
 */
function unenrollMember(req, res) {
  const { id, memberId } = req.params;
  EventModel.removeMember(id, memberId);
  res.redirect(`/events/${id}`);
}

module.exports = { listEvents, showEvent, enrollMember, unenrollMember };
