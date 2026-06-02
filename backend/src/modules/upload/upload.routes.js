const express = require('express');
const uploadController = require('./upload.controller');
const { authenticate } = require('../../middlewares/auth.middleware');
const requireAdmin = require('../../middlewares/admin.middleware');
const { uploadMiddleware } = require('../../middlewares/upload.middleware');

const router = express.Router();

router.post('/image', authenticate, requireAdmin, uploadMiddleware.single('image'), uploadController.uploadImage);
router.delete('/image/:publicId', authenticate, requireAdmin, uploadController.deleteImage);

module.exports = router;
