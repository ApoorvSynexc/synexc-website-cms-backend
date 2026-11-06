import { prisma } from '../../config/database/index.js';
import { Prisma, type Announcement } from '../../../generated/prisma/client.js';
import { db, NOT_DELETED, softDeleteData } from '../../utils/query.js';
import { mediaSelect } from '../media/index.js';

const include = { image: { select: mediaSelect } } as const;

const createAnnouncement = (data: Prisma.AnnouncementCreateInput) =>
  db('create announcement', () => prisma.announcement.create({ data, include }));

const updateAnnouncement = (where: Prisma.AnnouncementWhereUniqueInput, data: Prisma.AnnouncementUpdateInput) =>
  db('update announcement', () => prisma.announcement.update({ where, data, include }));

const deleteAnnouncement = (where: Prisma.AnnouncementWhereUniqueInput): Promise<Announcement> =>
  db('delete announcement', () => prisma.announcement.update({ where, data: softDeleteData() }));

const findAnnouncement = (where: Prisma.AnnouncementWhereInput) =>
  db('find announcement', () => prisma.announcement.findFirst({ where: { ...NOT_DELETED, ...where }, include }));

const findAnnouncementsWithPagination = (where: Prisma.AnnouncementWhereInput, skip: number, take: number) =>
  db('find announcements', async () => {
    const filter = { ...NOT_DELETED, ...where };
    const [announcements, total] = await Promise.all([
      prisma.announcement.findMany({ where: filter, include, orderBy: { startDate: 'desc' }, skip, take }),
      prisma.announcement.count({ where: filter }),
    ]);
    return { announcements, total };
  });

/** Announcements visitors should see today: switched on and inside their display window. */
const findLiveAnnouncements = (today: Date) =>
  db('find announcements', () =>
    prisma.announcement.findMany({
      where: { status: 'ACTIVE', startDate: { lte: today }, endDate: { gte: today } },
      include,
      orderBy: { startDate: 'desc' },
    }),
  );

export {
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  findAnnouncement,
  findAnnouncementsWithPagination,
  findLiveAnnouncements,
};
