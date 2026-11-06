import dotenv from 'dotenv';
dotenv.config();

// Database
const DATABASE_URL = String(process.env.DATABASE_URL || '');

// Authentication
const JWT_SECRET = String(process.env.JWT_SECRET || 'your-secret-key');
const JWT_EXPIRY = String(process.env.JWT_EXPIRY || '7d');

// AWS S3 Configuration
const AWS_REGION = String(process.env.AWS_REGION || 'us-east-1');
const AWS_S3_BUCKET = String(process.env.AWS_S3_BUCKET || '');
const AWS_S3_BASE_FOLDER = String(process.env.AWS_S3_BASE_FOLDER || 'uploads');
const AWS_ACCESS_KEY_ID = String(process.env.AWS_ACCESS_KEY_ID || '');
const AWS_SECRET_ACCESS_KEY = String(process.env.AWS_SECRET_ACCESS_KEY || '');
// Optional: point the S3 client at MinIO / a local S3-compatible server instead of AWS.
const AWS_S3_ENDPOINT = String(process.env.AWS_S3_ENDPOINT || '');
// Public base URL files are served from (a CDN in front of the bucket, or the bucket itself).
// Media rows store only the S3 *key*; the API prefixes this when sending files to clients.
const MEDIA_BASE_URL = String(
  process.env.MEDIA_BASE_URL ||
    (AWS_S3_ENDPOINT ? `${AWS_S3_ENDPOINT}/${AWS_S3_BUCKET}` : `https://${AWS_S3_BUCKET}.s3.${AWS_REGION}.amazonaws.com`),
).replace(/\/+$/, '');

// Status Constants — every table carries one of these in its `status` column
const STATUS = {
  active: 'ACTIVE',
  inactive: 'INACTIVE',
  deleted: 'DELETED',
};

const SESSION_STATUS = {
  active: 'ACTIVE',
  revoked: 'REVOKED',
};

const LANGUAGE = {
  en: 'en',
};

export {
  DATABASE_URL,
  JWT_SECRET,
  JWT_EXPIRY,
  AWS_REGION,
  AWS_S3_BUCKET,
  AWS_S3_BASE_FOLDER,
  AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY,
  AWS_S3_ENDPOINT,
  MEDIA_BASE_URL,
  LANGUAGE,
  STATUS,
  SESSION_STATUS,
};
