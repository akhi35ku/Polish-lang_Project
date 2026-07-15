const router = require('express').Router();
const { createTicket } = require('../controllers/supportController');
const { supportValidator } = require('../validators/supportValidators');
const { validate } = require('../middleware/validate');
const { authLimiter } = require('../middleware/rateLimiters');

router.post('/', authLimiter, supportValidator, validate, createTicket);

module.exports = router;
