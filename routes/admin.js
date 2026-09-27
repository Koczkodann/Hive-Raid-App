const express = require('express');
const router = express.Router();
const { requireAdmin } = require('../middleware/auth');
const {
  showPanel,
  showLogin,
  handleLogin,
  showSetup,
  handleSetup,
  handleLogout,
  createEvent,
  deleteEvent,
} = require('../controllers/adminController');

// --- Public auth routes ---
router.get('/login', showLogin);
router.post('/login', handleLogin);
router.get('/setup', showSetup);
router.post('/setup', handleSetup);
router.post('/logout', handleLogout);

// --- Protected admin routes (require login) ---
router.get('/', requireAdmin, showPanel);
router.post('/events', requireAdmin, createEvent);
router.post('/events/:id/delete', requireAdmin, deleteEvent);

module.exports = router;

