const userModel = require('../models/users/userModel');

const userController = {};

userController.createUser = (req, res) => {
  const { username, password, email } = req.body;

  userModel.createUser(username, password, email)
    .then(() => {
      res.redirect('/');
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
      res.status(200).redirect('/');
    })
    .catch((err) => {
      next(err);
    });
};

userController.logout = (req, res, next) => {
  userModel.logout(req);
  res.status(200).json({ message: 'User logged out successfully' });
};

userController.getCurrentUser = (req, res, next) => {
  userModel.getCurrentUser(req)
    .then((user) => {
      res.status(200).json({ user });
    })
    .catch((err) => {
      next(err);
    });
};

module.exports = userController;
