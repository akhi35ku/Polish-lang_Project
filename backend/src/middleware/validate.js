const { validationResult } = require('express-validator');

// Runs after express-validator chains: returns 422 with the first error per field.
function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const fieldErrors = {};
    for (const e of errors.array()) {
      if (!fieldErrors[e.path]) fieldErrors[e.path] = e.msg;
    }
    return res.status(422).json({
      success: false,
      message: Object.values(fieldErrors)[0],
      errors: fieldErrors,
    });
  }
  next();
}

module.exports = { validate };
