const { body, param, query } = require('express-validator');
const { passwordRules } = require('./authValidators');

const userIdParam = [param('id').isInt({ min: 1 }).withMessage('Invalid user id.').toInt()];

const statusValidator = [
  ...userIdParam,
  body('status').isIn(['ACTIVE', 'DISABLED']).withMessage('Status must be ACTIVE or DISABLED.'),
];

const adminResetPasswordValidator = [...userIdParam, passwordRules('newPassword')];

const listUsersValidator = [
  query('search').optional().trim().isLength({ max: 120 }),
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
];

module.exports = { userIdParam, statusValidator, adminResetPasswordValidator, listUsersValidator };
