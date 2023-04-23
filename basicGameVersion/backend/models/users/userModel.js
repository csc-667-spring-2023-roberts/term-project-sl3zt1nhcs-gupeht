const db = require('../../database/db');
const { CustomError } = require('../middleware/customErrorHandler');
const bcrypt = require('bcrypt');
const { getSession, setSession, clearSession } = require('../middleware/auth');

const userModel = {};

userModel.createUser = (username, password, email) => {
  return new Promise(async (resolve, reject) => {
    try {
      const existingUser = await userModel.getUserByUsername(username);
      if (existingUser) {
        reject(new CustomError('Username already exists', 409));
      } else {
        const hashedPassword = await bcrypt.hash(password, 10);
        const query = `INSERT INTO users (username, password, email) VALUES ($1, $2, $3) RETURNING *`;
        const values = [username, hashedPassword, email];

        db.query(query, values)
          .then((result) => {
            if (result.rowCount > 0) {
              resolve(result.rows[0]);
            } else {
              reject(new CustomError('No rows affected', 404));
            }
          })
          .catch((err) => {
            reject(err);
          });
      }
    } catch (err) {
      reject(err);
    }
  });
};

userModel.getUserById = (user_id) => {
  return new Promise((resolve, reject) => {
    const query = `SELECT user_id, username, email FROM users WHERE user_id = $1`;
    const values = [user_id];

    db.query(query, values)
      .then((result) => {
        if (result.rowCount > 0) {
          resolve(result.rows[0]);
        } else {
          reject(new CustomError('User not found', 404));
        }
      })
      .catch((err) => {
        reject(err);
      });
  });
};

userModel.getUserByUsername = (username) => {
  return new Promise((resolve, reject) => {
    const query = `SELECT user_id, username, password, email FROM users WHERE username = $1`;
    const values = [username];

    db.query(query, values)
      .then((result) => {
        if (result.rowCount > 0) {
          resolve(result.rows[0]);
        } else {
          resolve(null);
        }
      })
      .catch((err) => {
        reject(err);
      });
  });
};

userModel.comparePassword = (password, hashedPassword) => {
  return bcrypt.compare(password, hashedPassword);
};

userModel.login = (username, password) => {
  return new Promise(async (resolve, reject) => {
    try {
      const user = await userModel.getUserByUsername(username);
      if (user) {
        const passwordMatch = await userModel.comparePassword(password, user.password);
        if (passwordMatch) {
          // Remove the password field before returning the user object
          delete user.password;
          // Set session cookie
          setSession(user.user_id);
          resolve(user);
        } else {
          reject(new CustomError('Incorrect password', 401));
        }
      } else {
        reject(new CustomError('User not found', 404));
      }
    } catch (err) {
      reject(err);
    }
  });
};

userModel.logout = () => {
  return new Promise((resolve, reject) => {
    try {
      // Clear session cookie
      clearSession();
      resolve();
    } catch (err) {
      reject(err);
    }
  });
};

userModel.getCurrentUser = () => {
  return new Promise((resolve, reject) => {
    try {
      // Get user ID from session cookie
      const userId = getSession();
      if (userId) {
        // Get user by ID
        userModel.getUserById(userId)
          .then((user) => {
            // Remove the password field before returning the user object
            delete user.password;
            resolve(user);
          })
          .catch((err) => {
            reject(err);
          });
      } else {
        reject(new CustomError('User not authenticated', 401));
      }
    } catch (err) {
      reject(err);
    }
  });
};