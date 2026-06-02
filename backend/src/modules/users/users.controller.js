const usersService = require('./users.service');

async function getAllUsers(req, res, next) {
  try {
    const result = await usersService.getAllUsers(req.query);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function getCurrentUser(req, res, next) {
  try {
    const user = await usersService.getUserById(req.user.id);
    if (!user) return res.status(404).json({ message: 'Utilisateur introuvable.' });
    res.json(user);
  } catch (err) {
    next(err);
  }
}

async function updateCurrentUser(req, res, next) {
  try {
    const { role, ...safeData } = req.body;
    const updated = await usersService.updateUser(req.user.id, safeData);
    res.json(updated);
  } catch (err) {
    next(err);
  }
}

module.exports = { getAllUsers, getCurrentUser, updateCurrentUser };
