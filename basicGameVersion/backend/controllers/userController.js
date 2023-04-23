const userModel = require('.././models/users/userModel');

const userController = {};

userController.createUser = (req, res) => {
  const { username, email, password } = req.body;

  userModel.createUser(username, email, password)
    .then(() => {
      res.status(201).json({ message: 'User created successfully' });
    })
    .catch((err) => {
      res.status(err.status || 500).json({ message: err.message });
    });
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

userController.getCurrentUser = (req, res, next) => {
  
  const userId = req.user.id;

  userModel.getUserById(userId)
    .then((user) => {
      res.status(200).json({ user });
    })
    .catch((err) => {
      next(err);
    });
};

module.exports = userController;