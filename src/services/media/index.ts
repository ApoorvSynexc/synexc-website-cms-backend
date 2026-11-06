import { prisma } from '../../config/database/index.js';
import { Prisma, type Media } from '../../../generated/prisma/client.js';
import { db, NOT_DELETED } from '../../utils/query.js';

/** What other tables embed when they link to a file (the list/detail responses carry this object). */
const mediaSelect = {
  id: true,
  name: true,
  size: true,
  mimetype: true,
  url: true,
  thumbnailUrl: true,
} as const;

const createMedia = (data: Prisma.MediaCreateInput): Promise<Media> =>
  db('create media', () => prisma.media.create({ data }));

const findMedia = (where: Prisma.MediaWhereInput): Promise<Media | null> =>
  db('find media', () => prisma.media.findFirst({ where: { ...NOT_DELETED, ...where } }));

/**
 * Throws `invalid_reference` unless every given id is a real, non-deleted file.
 * Controllers call this before saving a record that links to media.
 */
const assertMediaExists = async (ids: Array<string | null | undefined>): Promise<void> => {
  const wanted = [...new Set(ids.filter((id): id is string => Boolean(id)))];
  if (wanted.length === 0) return;
  const found = await db('find media', () =>
    prisma.media.count({ where: { ...NOT_DELETED, id: { in: wanted } } }),
  );
  if (found !== wanted.length) throw new Error('invalid_reference');
};

/**
 * For a Prisma "checked" create/update: `undefined` leaves the link alone, `null`/'' clears it, an id links it.
 *   update:  { logo: mediaLink(body.logoId) }
 */
const mediaLink = (id: string | null | undefined) => {
  if (id === undefined) return undefined;
  return id ? { connect: { id } } : { disconnect: true as const };
};

/** Same for create, where there is nothing to disconnect. */
const mediaConnect = (id: string | null | undefined) => (id ? { connect: { id } } : undefined);

export { mediaSelect, createMedia, findMedia, assertMediaExists, mediaLink, mediaConnect };
