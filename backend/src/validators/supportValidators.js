const { body } = require('express-validator');

const supportValidator = [
  body('name').trim().notEmpty().withMessage('Name is required.').isLength({ max: 120 }).withMessage('Name too long.'),
  body('email').trim().isEmail().withMessage('Enter a valid email address.').normalizeEmail(),
  body('subject').trim().notEmpty().withMessage('Subject is required.').isLength({ max: 200 }).withMessage('Subject too long.'),
  body('message').trim().notEmpty().withMessage('Message is required.').isLength({ max: 5000 }).withMessage('Message too long.'),
];

module.exports = { supportValidator };
