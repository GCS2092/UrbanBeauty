const fs = require('fs').promises;
const cloudinary = require('../../config/cloudinary');

async function uploadImage(file) {
  try {
    const result = await cloudinary.uploader.upload(file.path, {
      folder: 'urbanbeauty/products',
      resource_type: 'image',
      // ✅ Limite la dimension max stockée + optimise qualité/format
      transformation: [
        { width: 1600, height: 1600, crop: 'limit' }, // jamais plus grand que 1600px, respecte le ratio
        { quality: 'auto:good', fetch_format: 'auto' },
      ],
    });

    return {
      url: result.secure_url,
      publicId: result.public_id,
    };
  } finally {
    // Supprime le fichier temporaire dans tous les cas
    if (file?.path) {
      fs.unlink(file.path).catch(() => {});
    }
  }
}

async function deleteImage(publicId) {
  // publicId Cloudinary peut contenir des "/" — on le décode
  const decoded = decodeURIComponent(publicId);
  await cloudinary.uploader.destroy(decoded, { resource_type: 'image' });
}

module.exports = { uploadImage, deleteImage };