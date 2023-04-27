const userModel = require('../models/users/userModel');

const userController = {};

userController.createUser = (req, res) => {
  const { username, password, email } = req.body;

  userModel.createUser(username, password, email)
    .then(() => {
      res.status(200).json({ message: 'User created successfully' });
    })
    .catch((err) => {
      res.status(err.status || 500).json({ message: err.message });
    })
};

userController.getUserById = (req, res) => {
  const { id } = req.params;

  userModel.getUserById(id)
    .then((user) => {
      if (!user) {
        throw new Error('User not found');
      }
      res.status(200).json(user);
    })
    .catch((err) => {
      res.status(err.status || 500).json({ message: err.message });
    });
};

userController.login = (req, res, next) => {
  const { username, password } = req.body;

  userModel.login(req, username, password)
    .then((user) => {
      // Return the JWT token in the response
      res.status(200).json({ user, token: req.session.token });
    })
    .catch((err) => {
      next(err);
    });
};

userController.logout = (req, res, next) => {
  if (req.method === 'POST' || req.method === 'GET') {
    userModel.logout(req);
    // Clear the JWT token from the session
    req.session.token = null;
    res.status(200).json({ message: 'User logged out successfully' });
  } else {
    next(new CustomError('Invalid HTTP method', 405));
  }
};


userController.getCurrentUser = (req, res, next) => {
  userModel.getCurrentUser(req)
    .then((user) => {
      res.locals.user = user;
      next();
    })
    .catch((err) => {
      res.locals.user = null;
      next();
    });
};
module.exports = userController;
