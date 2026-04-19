const multer = require('multer');

// Configure multer for memory storage
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    // Check file type
    const mimeType = String(file.mimetype || '').toLowerCase();
    const fileName = String(file.originalname || '').toLowerCase();
    const allowedMimes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/heic',
      'image/heif',
    ];
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.heic', '.heif'];
    const extensionMatch = allowedExtensions.some((ext) => fileName.endsWith(ext));

    if (allowedMimes.includes(mimeType) || (mimeType === 'application/octet-stream' && extensionMatch)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Allowed: JPEG, PNG, GIF, WebP, HEIC, HEIF.'));
    }
  },
  limits: {
    fileSize: 15 * 1024 * 1024 // 15MB limit to allow high-res camera images before optimization/conversion
  }
});

module.exports = upload;
