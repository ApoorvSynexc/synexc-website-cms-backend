import { Response } from 'express';
import { makeResponse } from '../../../../lib/response/index.js';
import { IRequest } from '../../../../lib/index.js';
import { wrapController } from '../../../../utils/index.js';
import { createMedia, uploadObject } from '../../../../services/index.js';

/**
 * POST /common/upload  (multipart, field "files", up to 10)
 *
 * Each file goes to S3 (images also get a thumbnail) and is registered as one Media row. The response lists the
 * Media rows — the caller then saves the `id` on the record that uses the file (blog.featuredImageId …).
 */
const uploadFile = async (req: IRequest, res: Response) => {
  const files = req.files as Express.Multer.File[] | undefined;
  if (!files || !Array.isArray(files) || files.length === 0) {
    throw new Error('No files provided');
  }

  const uploaded = await Promise.all(
    files.map(async (file) => {
      const result = await uploadObject({
        file: file.buffer,
        fileName: file.originalname,
        contentType: file.mimetype,
      });

      const media = await createMedia({
        name: file.originalname,
        size: file.size,
        url: result.key, // S3 keys; the response turns them into full URLs
        thumbnailUrl: result.thumbnailKey,
        mimetype: file.mimetype,
        ...(req.user?.id && { createdBy: { connect: { id: req.user.id } } }),
      });

      return {
        id: media.id,
        name: media.name,
        size: media.size,
        mimetype: media.mimetype,
        url: media.url,
        thumbnailUrl: media.thumbnailUrl,
      };
    }),
  );

  return makeResponse(req, res, 201, true, 'create', { files: uploaded, totalFiles: uploaded.length });
};

export const commonController = wrapController({ uploadFile });
