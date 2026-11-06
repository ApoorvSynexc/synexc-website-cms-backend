import multer from 'multer';

// Only images and common documents may be uploaded through the CMS.
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
const ALLOWED_DOCUMENT_TYPES = ['application/pdf'];
const ALLOWED_FILE_TYPES = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_DOCUMENT_TYPES];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const uploadMiddleware = multer({
  // Memory storage: the buffer goes straight to S3.
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_FILE_TYPES.includes(file.mimetype)) return cb(null, true);
    cb(new Error(`File type "${file.mimetype}" is not allowed. Upload an image or a PDF.`));
  },
});

export { uploadMiddleware, ALLOWED_IMAGE_TYPES, ALLOWED_DOCUMENT_TYPES, ALLOWED_FILE_TYPES, MAX_FILE_SIZE };
