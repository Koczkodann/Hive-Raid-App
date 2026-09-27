const express = require('express');
const router = express.Router();
const { requireAdmin } = require('../middleware/auth');
const {
  showEvent,
  enrollMember,
  unenrollMember,
} = require('../controllers/eventController');

// GET  /events/:id                     — view a single raid + roster
router.get('/:id', showEvent);

// POST /events/:id/enroll              — enroll in a raid (public)
router.post('/:id/enroll', enrollMember);

// POST /events/:id/unenroll/:memberId  — remove from a raid (admin only)
router.post('/:id/unenroll/:memberId', requireAdmin, unenrollMember);

module.exports = router;
