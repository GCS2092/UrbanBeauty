const express = require('express');
const uploadController = require('./upload.controller');
const { authenticate } = require('../../middlewares/auth.middleware');
const requireAdmin = require('../../middlewares/admin.middleware');
const { uploadMiddleware } = require('../../middlewares/upload.middleware');

const router = express.Router();

// POST /api/upload/image  — upload 1 image → { url, publicId }
router.post(
  '/image',
  authenticate,
  requireAdmin,
  uploadMiddleware.single('image'),
  uploadController.uploadImage,
);

// DELETE /api/upload/image/:publicId  — supprime une image Cloudinary
router.delete(
  '/image/:publicId',
  authenticate,
  requireAdmin,
  uploadController.deleteImage,
);

module.exports = router;