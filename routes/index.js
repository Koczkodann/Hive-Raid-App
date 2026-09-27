const express = require('express');
const router = express.Router();
const { listEvents } = require('../controllers/eventController');

// GET / — main page showing all upcoming raids
router.get('/', listEvents);

module.exports = router;
