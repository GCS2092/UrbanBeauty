const authService = require('./auth.service');

async function register(req, res, next) {
  try {
    const user = await authService.register(req.body);
    res.status(201).json(user);
  } catch (error) {
    next(error);
  }
}

async function login(req, res, next) {
  try {
    const data = await authService.login(req.body);
    res.json(data);
  } catch (error) {
    next(error);
  }
}

async function logout(req, res) {
  res.json({ message: 'Déconnexion réussie' });
}

async function me(req, res) {
  res.json(req.user);
}

module.exports = {
  authController: {
    register,
    login,
    logout,
    me,
  },
};
