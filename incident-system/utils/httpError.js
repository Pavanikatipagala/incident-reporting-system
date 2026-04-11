/** small helper to create errors with statusCode for errorHandler */
function createError(statusCode, message) {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
}

module.exports = createError;
