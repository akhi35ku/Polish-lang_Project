const path = require('path');
const router = require('express').Router();
const { requireAuth } = require('../middleware/auth');

/* Protected course content.
   The full PolskiPath app (single-file HTML) is only served to
   authenticated users — no login, no course. */
router.get('/course', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'assets', 'polskipath.html'));
});

module.exports = router;
