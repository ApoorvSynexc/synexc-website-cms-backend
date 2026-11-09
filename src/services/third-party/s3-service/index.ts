import path from 'path';
import sharp from 'sharp';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import {
  AWS_REGION,
  AWS_S3_BUCKET,
  AWS_S3_BASE_FOLDER,
  AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY,
} from '../../../constant/index.js';

interface UploadObjectParams {
  file: Buffer;
  fileName?: string;
  contentType?: string;
  folder?: string;
}

interface UploadResponse {
  /** S3 object key of the file — stored in Media.url. */
  key: string;
  /** S3 object key of the thumbnail (images only) — stored in Media.thumbnailUrl. */
  thumbnailKey: string | null;
  contentType: string;
  fileName: string;
  sizeInBytes: number;
}

const s3Client = new S3Client({
  region: AWS_REGION,
  ...(AWS_ACCESS_KEY_ID && AWS_SECRET_ACCESS_KEY && {
    credentials: { accessKeyId: AWS_ACCESS_KEY_ID, secretAccessKey: AWS_SECRET_ACCESS_KEY },
  }),
});

/** Raster images get a thumbnail. SVG and PDF are served as they are. */
const THUMBNAIL_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const THUMBNAIL_WIDTH = 400;

/** "My Photo (1).PNG" -> "my-photo-1" */
const safeBaseName = (fileName: string): string =>
  path
    .parse(fileName)
    .name.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'file';

const put = (key: string, body: Buffer, contentType: string) =>
  s3Client.send(
    new PutObjectCommand({
      Bucket: AWS_S3_BUCKET,
      Key: key,
      Body: body,
      ContentType: contentType,
      Metadata: { uploadedAt: new Date().toISOString() },
    }),
  );

/** A 400px-wide WebP copy, never enlarged. Returns null if the image cannot be decoded. */
const makeThumbnail = async (file: Buffer): Promise<Buffer | null> => {
  try {
    return await sharp(file).rotate().resize({ width: THUMBNAIL_WIDTH, withoutEnlargement: true }).webp({ quality: 80 }).toBuffer();
  } catch (error) {
    console.error('Thumbnail error (file uploaded without one):', error);
    return null;
  }
};

const uploadObject = async (params: UploadObjectParams): Promise<UploadResponse> => {
  const { file, fileName = 'file', contentType = 'application/octet-stream', folder = AWS_S3_BASE_FOLDER } = params;

  // Keep the original extension (the HRM version forced ".jpg", which broke PNG/PDF uploads).
  const extension = path.extname(fileName).toLowerCase();
  const stem = `${safeBaseName(fileName)}_${Date.now()}`;
  const key = `${folder}/${stem}${extension}`;

  try {
    await put(key, file, contentType);

    let thumbnailKey: string | null = null;
    if (THUMBNAIL_TYPES.includes(contentType)) {
      const thumbnail = await makeThumbnail(file);
      if (thumbnail) {
        thumbnailKey = `${folder}/thumbs/${stem}.webp`;
        await put(thumbnailKey, thumbnail, 'image/webp');
      }
    }

    return { key, thumbnailKey, contentType, fileName: `${stem}${extension}`, sizeInBytes: file.byteLength };
  } catch (error: any) {
    console.error('S3 Upload Error:', error);
    throw new Error(`Failed to upload file: ${error.message}`);
  }
};

export { uploadObject };
export type { UploadResponse };
