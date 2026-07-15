const { body } = require('express-validator');

const passwordRules = (field = 'password') =>
  body(field)
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters.')
    .matches(/[a-z]/).withMessage('Password must contain a lowercase letter.')
    .matches(/[A-Z]/).withMessage('Password must contain an uppercase letter.')
    .matches(/[0-9]/).withMessage('Password must contain a number.')
    .matches(/[^A-Za-z0-9]/).withMessage('Password must contain a special character.');

const registerValidator = [
  body('firstName').trim().notEmpty().withMessage('First name is required.').isLength({ max: 60 }).withMessage('First name too long.'),
  body('lastName').trim().notEmpty().withMessage('Last name is required.').isLength({ max: 60 }).withMessage('Last name too long.'),
  body('email').trim().isEmail().withMessage('Enter a valid email address.').normalizeEmail(),
  body('phone').trim().matches(/^\+?[0-9]{7,15}$/).withMessage('Enter a valid phone number (7–15 digits, optional +).'),
  passwordRules(),
  body('confirmPassword').custom((v, { req }) => {
    if (v !== req.body.password) throw new Error('Passwords do not match.');
    return true;
  }),
];

const loginValidator = [
  body('email').trim().isEmail().withMessage('Enter a valid email address.').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required.'),
  body('rememberMe').optional().isBoolean().withMessage('rememberMe must be a boolean.'),
];

const forgotPasswordValidator = [
  body('email').trim().isEmail().withMessage('Enter a valid email address.').normalizeEmail(),
];

const verifyOtpValidator = [
  body('email').trim().isEmail().withMessage('Enter a valid email address.').normalizeEmail(),
  body('otp').trim().matches(/^[0-9]{6}$/).withMessage('OTP must be exactly 6 digits.'),
];

const resetPasswordValidator = [
  body('resetToken').notEmpty().withMessage('Reset token is required.'),
  passwordRules('newPassword'),
  body('confirmPassword').custom((v, { req }) => {
    if (v !== req.body.newPassword) throw new Error('Passwords do not match.');
    return true;
  }),
];

module.exports = {
  registerValidator,
  loginValidator,
  forgotPasswordValidator,
  verifyOtpValidator,
  resetPasswordValidator,
  passwordRules,
};
