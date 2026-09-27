const EventModel = require('../models/eventModel');
const { ROLE_CATEGORIES, ALL_JOBS } = require('../config/roles');

/**
 * GET / — render the main events listing page.
 */
function listEvents(req, res) {
  const events = EventModel.getAll();
  res.render('index', { title: 'Upcoming Raids', events });
}

/**
 * GET /events/:id — render a single event with its roster and enroll form.
 */
function showEvent(req, res) {
  const event = EventModel.getById(req.params.id);
  if (!event) return res.status(404).render('404', { title: 'Raid Not Found' });

  res.render('event', {
    title: event.name,
    event,
    roleCategories: ROLE_CATEGORIES,
  });
}

/**
 * POST /events/:id/enroll — add a member to the event roster.
 */
function enrollMember(req, res) {
  const { name, role } = req.body;
  const eventId = req.params.id;

  // Basic validation
  if (!name || !name.trim()) {
    return res.redirect(`/events/${eventId}?error=Name is required`);
  }
  if (!ALL_JOBS.includes(role)) {
    return res.redirect(`/events/${eventId}?error=Invalid role selected`);
  }

  EventModel.addMember(eventId, { name: name.trim(), role });
  res.redirect(`/events/${eventId}`);
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
