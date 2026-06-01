const express = require('express');
const usersController = require('./users.controller');
const authenticate = require('../../middlewares/auth.middleware');
const requireAdmin = require('../../middlewares/admin.middleware');
const router = express.Router();

// GET /api/users/admin/all — liste tous les utilisateurs (admin)
router.get('/admin/all', authenticate, requireAdmin, usersController.getAllUsers);

// GET /api/users — mon profil
router.get('/', authenticate, usersController.getCurrentUser);

// PUT /api/users — modifier mon profil
router.put('/', authenticate, usersController.updateCurrentUser);

module.exports = router;