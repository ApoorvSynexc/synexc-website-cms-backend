import dayjs from 'dayjs';
import { prisma } from '../../config/database/index.js';
import { db, NOT_DELETED } from '../../utils/query.js';

const withCategory = { category: { select: { id: true, name: true } } } as const;
const newestFirst = [{ publishedAt: 'desc' }, { createdAt: 'desc' }] as const;

/** Numbers for the blog overview: totals, per-category counts, 6-month activity, recent and draft blogs. */
const getBlogStats = () =>
  db('load blog stats', async () => {
    const monthStart = dayjs().startOf('month').toDate();
    const sixMonthsAgo = dayjs().startOf('month').subtract(5, 'month').toDate();
    const published = { ...NOT_DELETED, publishStatus: 'PUBLISHED' } as const;

    const [total, publishedCount, publishedThisMonth, byCategory, categories, monthRows, recent, drafted] =
      await Promise.all([
        prisma.blog.count({ where: NOT_DELETED }),
        prisma.blog.count({ where: published }),
        prisma.blog.count({ where: { ...published, publishedAt: { gte: monthStart } } }),
        prisma.blog.groupBy({ by: ['categoryId'], where: NOT_DELETED, _count: { _all: true } }),
        prisma.blogCategory.findMany({ where: NOT_DELETED, select: { id: true, name: true } }),
        prisma.blog.findMany({ where: { ...published, publishedAt: { gte: sixMonthsAgo } }, select: { publishedAt: true } }),
        prisma.blog.findMany({ where: NOT_DELETED, orderBy: [...newestFirst], take: 5, include: withCategory }),
        prisma.blog.findMany({
          where: { ...NOT_DELETED, publishStatus: 'DRAFT' },
          orderBy: [...newestFirst],
          take: 5,
          include: withCategory,
        }),
      ]);

    const categoryName = new Map(categories.map((c) => [c.id, c.name]));

    // Always 6 buckets (oldest -> newest), even when a month has no posts.
    const byMonth = Array.from({ length: 6 }, (_, i) => {
      const month = dayjs().startOf('month').subtract(5 - i, 'month');
      const key = month.format('YYYY-MM');
      return {
        month: key,
        label: month.format('MMM'),
        count: monthRows.filter((row) => dayjs(row.publishedAt).format('YYYY-MM') === key).length,
      };
    });

    return {
      total,
      published: publishedCount,
      drafts: total - publishedCount,
      publishedThisMonth,
      byCategory: byCategory.map((row) => ({
        categoryId: row.categoryId,
        name: categoryName.get(row.categoryId) ?? 'Uncategorised',
        count: row._count._all,
      })),
      byMonth,
      recent,
      drafted,
    };
  });

type Section = Record<string, unknown>;

/** Content lists on the website: permission subject -> how to count its rows. */
const CONTENT_COUNTS: Record<string, () => Promise<[number, number]>> = {
  hero_slide: () => visibility(prisma.heroSlide),
  testimonial: () => visibility(prisma.testimonial),
  faq: () => visibility(prisma.faq),
  partner_logo: () => visibility(prisma.partnerLogo),
  team_member: () => visibility(prisma.teamMember),
  timeline_event: () => visibility(prisma.timelineEvent),
  certification: () => visibility(prisma.certification),
  key_stat: () => visibility(prisma.keyStat),
  gallery_image: () => visibility(prisma.galleryImage),
};

/** [all rows, rows visible on the website] for a status-bearing table. */
const visibility = async (model: { count: (args: { where: object }) => Promise<number> }): Promise<[number, number]> => {
  const [total, visible] = await Promise.all([model.count({ where: NOT_DELETED }), model.count({ where: { status: 'ACTIVE' } })]);
  return [total, visible];
};

const publishCounts = async (model: { count: (args: { where: object }) => Promise<number> }) => {
  const [total, published] = await Promise.all([
    model.count({ where: NOT_DELETED }),
    model.count({ where: { ...NOT_DELETED, publishStatus: 'PUBLISHED' } }),
  ]);
  return { total, published, drafts: total - published };
};

/**
 * Cross-module summary for the dashboard. Only the sections the caller may read are computed and returned, so a
 * user with partial access never sees (or pays for) numbers from modules they cannot open.
 */
const getDashboardOverview = (granted: Set<string>) =>
  db('load dashboard overview', async () => {
    const can = (subject: string) => granted.has(`read:${subject}`);
    const today = dayjs().startOf('day').toDate();
    const out: Section = {};
    const jobs: Promise<void>[] = [];
    const job = (fn: () => Promise<void>) => void jobs.push(fn());

    if (can('blog')) job(async () => void (out.blog = await publishCounts(prisma.blog)));
    if (can('case_study')) job(async () => void (out.caseStudy = await publishCounts(prisma.caseStudy)));

    if (can('announcement')) {
      job(async () => {
        const live = { ...NOT_DELETED, status: 'ACTIVE', startDate: { lte: today }, endDate: { gte: today } } as const;
        const [total, liveNow, upcoming] = await Promise.all([
          prisma.announcement.count({ where: NOT_DELETED }),
          prisma.announcement.count({ where: live }),
          prisma.announcement.count({ where: { ...NOT_DELETED, status: 'ACTIVE', startDate: { gt: today } } }),
        ]);
        out.announcement = { total, live: liveNow, upcoming, ended: total - liveNow - upcoming };
      });
    }

    const contentSubjects = Object.keys(CONTENT_COUNTS).filter(can);
    if (contentSubjects.length) {
      job(async () => {
        out.content = await Promise.all(
          contentSubjects.map(async (subject) => {
            const [total, visible] = await CONTENT_COUNTS[subject]();
            return { subject, total, visible };
          }),
        );
      });
    }

    if (can('user')) {
      job(async () => {
        const [total, active, locked] = await Promise.all([
          prisma.user.count({ where: NOT_DELETED }),
          prisma.user.count({ where: { status: 'ACTIVE' } }),
          prisma.user.count({ where: { ...NOT_DELETED, lockedUntil: { gt: new Date() } } }),
        ]);
        out.users = { total, active, locked };
      });
    }
    if (can('role')) job(async () => void (out.roles = { total: await prisma.role.count({ where: NOT_DELETED }) }));

    // Needs attention: drafts untouched for 14+ days, and live announcements that end within 7 days.
    const staleBefore = dayjs().subtract(14, 'day').toDate();
    const attention: { staleDrafts?: Section; endingSoon?: Section[] } = {};
    const stale = { ...NOT_DELETED, publishStatus: 'DRAFT', updatedAt: { lt: staleBefore } } as const;
    if (can('blog') || can('case_study')) {
      job(async () => {
        const [blogs, studies] = await Promise.all([
          can('blog') ? prisma.blog.count({ where: stale }) : 0,
          can('case_study') ? prisma.caseStudy.count({ where: stale }) : 0,
        ]);
        attention.staleDrafts = { blogs, caseStudies: studies };
      });
    }
    if (can('announcement')) {
      job(async () => {
        const soon = dayjs().add(7, 'day').startOf('day').toDate();
        attention.endingSoon = await prisma.announcement.findMany({
          where: { ...NOT_DELETED, status: 'ACTIVE', startDate: { lte: today }, endDate: { gte: today, lte: soon } },
          orderBy: { endDate: 'asc' },
          take: 5,
          select: { id: true, title: true, endDate: true },
        });
      });
    }

    // Latest posts and case studies, newest first, from whichever of the two the caller can read.
    const recent: { type: string; id: string; title: string; publishStatus: string; date: Date }[] = [];
    if (can('blog')) {
      job(async () => {
        const rows = await prisma.blog.findMany({ where: NOT_DELETED, orderBy: [...newestFirst], take: 5, select: { id: true, title: true, publishStatus: true, publishedAt: true } });
        recent.push(...rows.map((r) => ({ type: 'blog', id: r.id, title: r.title, publishStatus: r.publishStatus, date: r.publishedAt })));
      });
    }
    if (can('case_study')) {
      job(async () => {
        const rows = await prisma.caseStudy.findMany({ where: NOT_DELETED, orderBy: [...newestFirst], take: 5, select: { id: true, title: true, publishStatus: true, publishedAt: true } });
        recent.push(...rows.map((r) => ({ type: 'case_study', id: r.id, title: r.title, publishStatus: r.publishStatus, date: r.publishedAt })));
      });
    }

    await Promise.all(jobs);
    out.attention = attention;
    out.recent = recent.sort((a, b) => +b.date - +a.date).slice(0, 6);
    return out;
  });

export { getBlogStats, getDashboardOverview };
