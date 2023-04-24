const jwt = require('jsonwebtoken');
const { CustomError } = require('../middleware/customErrorHandler');
const db = require('../database/db');

const authMiddleware = (req, res, next) => {
  // Get the JWT token from the request headers
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new CustomError('Authorization header missing or invalid', 401));
  }

  const token = authHeader.split(' ')[1];

  // Verify the token and extract the user ID
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return next(new CustomError('Invalid token', 401));
    }

    const userId = decoded.sub;

    // Check if the user exists in the database
    db.query('SELECT * FROM users WHERE user_id = $1', [userId])
      .then((result) => {
        if (result.rowCount === 0) {
          return next(new CustomError('User not found', 401));
        }

        // Add the user ID to the request object so that it can be accessed by subsequent middleware functions
        req.userId = userId;

        next();
      })
      .catch((err) => {
        next(new CustomError('Error while verifying user', 500));
      });
  });
};

module.exports = authMiddleware;