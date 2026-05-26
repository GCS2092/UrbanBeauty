const fs = require('fs').promises;
const cloudinary = require('../../config/cloudinary');

async function uploadImage(file) {
  try {
    const result = await cloudinary.uploader.upload(file.path, {
      folder: 'boutique-mode',
      resource_type: 'image',
    });

    return {
      url: result.secure_url,
      publicId: result.public_id,
    };
  } finally {
    if (file.path) {
      fs.unlink(file.path).catch(() => {});
    }
  }
}

async function deleteImage(publicId) {
  await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
}

module.exports = {
  uploadImage,
  deleteImage,
};
