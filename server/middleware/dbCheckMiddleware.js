const mongoose = require('mongoose');

/**
 * Middleware to verify MongoDB connection state before executing database queries.
 * Prevents requests from buffering for 10000ms when the database is unreachable
 * and returns an immediate, actionable HTTP 503 Service Unavailable response.
 */
const checkDBConnection = (req, res, next) => {
  // readyState: 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      success: false,
      code: 'DATABASE_UNAVAILABLE',
      message:
        'Database service is currently unavailable. Please verify that your MongoDB Atlas cluster is active and your current IP address is whitelisted in MongoDB Atlas Network Access (Security -> Network Access).',
      readyState: mongoose.connection.readyState,
    });
  }
  next();
};

module.exports = { checkDBConnection };
