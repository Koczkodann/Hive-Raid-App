const EventModel = require('../models/eventModel');
const AdminModel = require('../models/adminModel');

/**
 * GET /admin — render the admin panel (requires login).
 */
function showPanel(req, res) {
  const events = EventModel.getAll();
  res.render('admin', { title: 'Admin Panel', events });
}

/**
 * GET /admin/login — show login page (or redirect to setup if no password set).
 */
function showLogin(req, res) {
  if (req.session.isAdmin) return res.redirect('/admin');
  if (!AdminModel.isSetUp()) return res.redirect('/admin/setup');
  res.render('login', { title: 'Admin Login' });
}

/**
 * POST /admin/login — authenticate.
 */
async function handleLogin(req, res) {
  const { password } = req.body;

  if (!password) {
    return res.redirect('/admin/login?error=Password is required');
  }

  const valid = await AdminModel.verifyPassword(password);
  if (!valid) {
    return res.redirect('/admin/login?error=Incorrect password');
  }

  req.session.isAdmin = true;
  res.redirect('/admin');
}

/**
 * GET /admin/setup — show first-time password setup (only if no password set).
 */
function showSetup(req, res) {
  if (AdminModel.isSetUp()) return res.redirect('/admin/login');
  res.render('setup', { title: 'Admin Setup' });
}

/**
 * POST /admin/setup — set the admin password for the first time.
 */
async function handleSetup(req, res) {
  if (AdminModel.isSetUp()) return res.redirect('/admin/login');

  const { password, confirm } = req.body;

  if (!password || password.length < 4) {
    return res.redirect('/admin/setup?error=Password must be at least 4 characters');
  }
  if (password !== confirm) {
    return res.redirect('/admin/setup?error=Passwords do not match');
  }

  await AdminModel.setPassword(password);
  req.session.isAdmin = true;
  res.redirect('/admin?success=Password set! You are now logged in.');
}

/**
 * POST /admin/logout — destroy session and redirect.
 */
function handleLogout(req, res) {
  req.session.destroy(() => {
    res.redirect('/?success=Logged out');
  });
}

/**
 * POST /admin/events — create a new event.
 */
function createEvent(req, res) {
  const { name, datetime, description } = req.body;

  if (!name || !name.trim() || !datetime) {
    return res.redirect('/admin?error=Name and date/time are required');
  }

  EventModel.create({
    name: name.trim(),
    datetime,
    description: description ? description.trim() : '',
  });

  res.redirect('/admin?success=Event created');
}

/**
 * POST /admin/events/:id/delete — delete an event.
 */
function deleteEvent(req, res) {
  EventModel.remove(req.params.id);
  res.redirect('/admin?success=Event deleted');
}

module.exports = {
  showPanel,
  showLogin,
  handleLogin,
  showSetup,
  handleSetup,
  handleLogout,
  createEvent,
  deleteEvent,
};

