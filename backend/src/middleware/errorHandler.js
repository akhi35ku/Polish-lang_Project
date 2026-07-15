// Centralized error handler — never leaks stack traces in production.
function notFound(req, res) {
  res.status(404).json({ success: false, message: 'Route not found.' });
}

function errorHandler(err, req, res, _next) {
  console.error(`[${new Date().toISOString()}]`, err);
  // Prisma unique constraint
  if (err.code === 'P2002') {
    return res.status(409).json({ success: false, message: 'That value is already in use.' });
  }
  const status = err.status || 500;
  res.status(status).json({
    success: false,
    message:
      process.env.NODE_ENV === 'production' && status === 500
        ? 'Something went wrong. Please try again.'
        : err.message || 'Server error.',
  });
}

module.exports = { notFound, errorHandler };
