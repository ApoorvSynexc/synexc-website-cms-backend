import { Response } from 'express';
import { makeResponse } from '../../../../lib/response/index.js';
import { IRequest } from '../../../../lib/index.js';
import { buildMeta, parsePagination, toDate, wrapController } from '../../../../utils/index.js';
import {
  assertMediaExists,
  createAnnouncement,
  deleteAnnouncement,
  findAnnouncement,
  findAnnouncementsWithPagination,
  mediaConnect,
  mediaLink,
  updateAnnouncement,
} from '../../../../services/index.js';

const createHandler = async (req: IRequest, res: Response) => {
  const { badge, title, message, type, eventDate, venue, ctaLabel, ctaUrl, imageId, startDate, endDate, status } = req.body;

  await assertMediaExists([imageId]);
  const announcement = await createAnnouncement({
    badge: badge || undefined,
    title,
    message,
    type: type ?? 'POPUP',
    eventDate: eventDate ? toDate(eventDate) : undefined,
    venue: venue || undefined,
    ctaLabel: ctaLabel || undefined,
    ctaUrl: ctaUrl || undefined,
    image: mediaConnect(imageId),
    startDate: toDate(startDate),
    endDate: toDate(endDate),
    status: status ?? 'ACTIVE',
    ...(req.user?.id && { createdBy: { connect: { id: req.user.id } } }),
  });
  return makeResponse(req, res, 201, true, 'create', announcement);
};

const findAnnouncementsHandler = async (req: IRequest, res: Response) => {
  const { page, limit, skip } = parsePagination(req.query);
  const { search, type } = req.query as Record<string, string | undefined>;

  const { announcements, total } = await findAnnouncementsWithPagination(
    {
      ...(type && { type: type as 'POPUP' | 'BANNER' }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { badge: { contains: search, mode: 'insensitive' } },
        ],
      }),
    },
    skip,
    limit,
  );
  return makeResponse(req, res, 200, true, 'fetch', announcements, buildMeta(page, limit, total));
};

const findAnnouncementHandler = async (req: IRequest, res: Response) => {
  const announcement = await findAnnouncement({ id: String(req.query.id) });
  if (!announcement) return makeResponse(req, res, 404, false, 'not_exist');
  return makeResponse(req, res, 200, true, 'fetch', announcement);
};

const updateHandler = async (req: IRequest, res: Response) => {
  const { id, badge, title, message, type, eventDate, venue, ctaLabel, ctaUrl, imageId, startDate, endDate, status } = req.body;

  const existing = await findAnnouncement({ id });
  if (!existing) return makeResponse(req, res, 404, false, 'not_exist');
  await assertMediaExists([imageId]);

  // The end date must still be on/after the start date once only one of them changes.
  const nextStart = startDate ? toDate(startDate) : existing.startDate;
  const nextEnd = endDate ? toDate(endDate) : existing.endDate;
  if (nextEnd < nextStart) throw new Error('End date must be on or after the start date');

  const announcement = await updateAnnouncement(
    { id },
    {
      ...(badge !== undefined && { badge: badge || null }),
      ...(title !== undefined && { title }),
      ...(message !== undefined && { message }),
      ...(type && { type }),
      ...(eventDate !== undefined && { eventDate: eventDate ? toDate(eventDate) : null }),
      ...(venue !== undefined && { venue: venue || null }),
      ...(ctaLabel !== undefined && { ctaLabel: ctaLabel || null }),
      ...(ctaUrl !== undefined && { ctaUrl: ctaUrl || null }),
      image: mediaLink(imageId),
      ...(startDate && { startDate: nextStart }),
      ...(endDate && { endDate: nextEnd }),
      ...(status && { status }),
    },
  );
  return makeResponse(req, res, 200, true, 'update', announcement);
};

const deleteHandler = async (req: IRequest, res: Response) => {
  const id = String(req.query.id ?? '');
  if (!id) throw new Error('Announcement ID is required in query params');
  if (!(await findAnnouncement({ id }))) return makeResponse(req, res, 404, false, 'not_exist');

  await deleteAnnouncement({ id });
  return makeResponse(req, res, 200, true, 'delete', null);
};

export const announcementController = wrapController({
  createHandler,
  findAnnouncementsHandler,
  findAnnouncementHandler,
  updateHandler,
  deleteHandler,
});
