import { prisma } from '../../config/database/index.js';
import { Prisma, type Blog } from '../../../generated/prisma/client.js';
import { db, NOT_DELETED, softDeleteData } from '../../utils/query.js';
import { mediaSelect } from '../media/index.js';

const include = {
  category: { select: { id: true, name: true, slug: true } },
  featuredImage: { select: mediaSelect },
} as const;

const createBlog = (data: Prisma.BlogCreateInput) => db('create blog', () => prisma.blog.create({ data, include }));

const updateBlog = (where: Prisma.BlogWhereUniqueInput, data: Prisma.BlogUpdateInput) =>
  db('update blog', () => prisma.blog.update({ where, data, include }));

/** Soft delete: only flags the row DELETED (status + deletedAt) — every other column keeps its value. */
const deleteBlog = (id: string): Promise<Blog> =>
  db('delete blog', () => prisma.blog.update({ where: { id }, data: softDeleteData() }));

const findBlog = (where: Prisma.BlogWhereInput) =>
  db('find blog', () => prisma.blog.findFirst({ where: { ...NOT_DELETED, ...where }, include }));

/** `omitContent` skips the (large) HTML body — used by public lists, which only need the card fields. */
const findBlogsWithPagination = (where: Prisma.BlogWhereInput, skip: number, take: number, omitContent = false) =>
  db('find blogs', async () => {
    const filter = { ...NOT_DELETED, ...where };
    const [blogs, total] = await Promise.all([
      prisma.blog.findMany({
        where: filter,
        include,
        ...(omitContent && { omit: { content: true } }),
        orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
        skip,
        take,
      }),
      prisma.blog.count({ where: filter }),
    ]);
    return { blogs, total };
  });

const countBlogs = (where?: Prisma.BlogWhereInput): Promise<number> =>
  db('count blogs', () => prisma.blog.count({ where: { ...NOT_DELETED, ...where } }));

export { createBlog, updateBlog, deleteBlog, findBlog, findBlogsWithPagination, countBlogs };
