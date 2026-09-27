const AdminModel = require('../models/adminModel');

/**
 * Middleware: attach isAdmin flag to res.locals for all views.
 */
function attachAdminStatus(req, res, next) {
  res.locals.isAdmin = req.session && req.session.isAdmin === true;
  next();
}

/**
 * Middleware: require admin login. Redirects to login page if not authenticated.
 */
function requireAdmin(req, res, next) {
  if (req.session && req.session.isAdmin === true) {
    return next();
  }
  res.redirect('/admin/login');
}

module.exports = { attachAdminStatus, requireAdmin };
