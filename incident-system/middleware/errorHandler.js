/**
 * Central Express error handler.
 * Send consistent JSON errors to the client.
 */
const multer = require('multer');

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({
      success: false,
      message: err.code === 'LIMIT_FILE_SIZE' ? 'Image too large (max 5MB)' : err.message,
    });
  }
  const status = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  console.error(err);
  res.status(status).json({
    success: false,
    message,
    // Only expose stack in development
    ...(process.env.NODE_ENV !== 'production' && err.stack ? { stack: err.stack } : {}),
  });
}

module.exports = errorHandler;
