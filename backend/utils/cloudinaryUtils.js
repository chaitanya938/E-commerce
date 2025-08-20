const cloudinary = require('../config/cloudinary');

// Extract public ID from Cloudinary URL
const extractPublicId = (url) => {
  if (!url) return null;
  
  // Handle different Cloudinary URL formats
  const match = url.match(/\/v\d+\/([^\/]+)\./);
  if (match) {
    return match[1];
  }
  
  // Fallback for other URL formats
  const parts = url.split('/');
  const filename = parts[parts.length - 1];
  if (filename) {
    return filename.split('.')[0];
  }
  
  return null;
};

// Delete image from Cloudinary
const deleteImage = async (imageUrl) => {
  try {
    const publicId = extractPublicId(imageUrl);
    if (publicId) {
      const result = await cloudinary.uploader.destroy(publicId);
      console.log('Image deleted from Cloudinary:', result);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error deleting image from Cloudinary:', error);
    return false;
  }
};

// Delete multiple images from Cloudinary
const deleteMultipleImages = async (imageUrls) => {
  try {
    const deletePromises = imageUrls.map(url => deleteImage(url));
    const results = await Promise.all(deletePromises);
    return results.every(result => result);
  } catch (error) {
    console.error('Error deleting multiple images from Cloudinary:', error);
    return false;
  }
};

module.exports = {
  deleteImage,
  deleteMultipleImages,
  extractPublicId
};
