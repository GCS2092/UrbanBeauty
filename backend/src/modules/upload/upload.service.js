const fs = require('fs').promises;
const cloudinary = require('../../config/cloudinary');

async function uploadImage(file) {
  try {
    const result = await cloudinary.uploader.upload(file.path, {
      folder: 'urbanbeauty/products',
      resource_type: 'image',
      transformation: [
        { width: 1600, height: 1600, crop: 'limit' },
        { quality: 'auto:good', fetch_format: 'auto' },
      ],
    });

    return {
      url: result.secure_url,
      publicId: result.public_id,
    };
  } finally {
    if (file?.path) {
      fs.unlink(file.path).catch(() => {});
    }
  }
}

// Upload plusieurs images en parallèle
async function uploadImages(files) {
  const results = await Promise.allSettled(files.map((file) => uploadImage(file)));

  return results.map((r, i) => {
    if (r.status === 'fulfilled') {
      return { success: true, originalName: files[i].originalname, ...r.value };
    }
    return { success: false, originalName: files[i].originalname, error: r.reason.message };
  });
}

async function deleteImage(publicId) {
  const decoded = decodeURIComponent(publicId);
  await cloudinary.uploader.destroy(decoded, { resource_type: 'image' });
}

module.exports = { uploadImage, uploadImages, deleteImage };