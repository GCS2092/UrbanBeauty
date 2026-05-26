const usersService = require('./users.service');

async function getCurrentUser(req, res, next) {
  try {
    const user = await usersService.getUserById(req.user.id);
    res.json(user);
  } catch (error) {
    next(error);
  }
}

async function updateCurrentUser(req, res, next) {
  try {
    const user = await usersService.updateUser(req.user.id, req.body);
    res.json(user);
  } catch (error) {
    next(error);
  }
}

const usersController = {
  getCurrentUser,
  updateCurrentUser,
};

module.exports = usersController;
