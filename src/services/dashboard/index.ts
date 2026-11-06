import dayjs from 'dayjs';
import { prisma } from '../../config/database/index.js';
import { db, NOT_DELETED } from '../../utils/query.js';

const withCategory = { category: { select: { id: true, name: true } } } as const;
const newestFirst = [{ publishedAt: 'desc' }, { createdAt: 'desc' }] as const;

/** Numbers for the CMS dashboard: totals, per-category counts, 6-month activity, recent and draft blogs. */
const getDashboardStats = () =>
  db('load dashboard', async () => {
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

export { getDashboardStats };
