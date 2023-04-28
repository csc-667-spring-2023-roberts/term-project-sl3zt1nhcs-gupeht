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

// Update the login function in userController

userController.login = (req, res, next) => {
  const { username, password } = req.body;

  userModel.login( username, password)
    .then(async (user) => {
      /*
      In the userController.login method, after successfully
      logging in, we need to set the user in the session
      data so that we can retrieve it later. We can do
      this by adding the following line of code:
      */
      req.session.userId = user.user_id;
      console.log(req.session.userId);
      const token = user.auth_token;
      delete user.auth_token;

      res.status(200).json({ user, token });
    })
    .catch((err) => {
      next(err);
    });
};


userController.logout = async (req, res, next) => {
  if (req.method === 'POST' || req.method === 'GET') {
    try {
      // Clear the JWT token from the database
      await userModel.clearAuthToken(req.user.sub);

      userModel.logout(req);
      res.status(200).json({ message: 'User logged out successfully' });
    } catch (err) {
      next(err);
    }
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
