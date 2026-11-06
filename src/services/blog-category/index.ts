import { prisma } from '../../config/database/index.js';
import { Prisma, type BlogCategory } from '../../../generated/prisma/client.js';
import { db, NOT_DELETED, softDeleteData } from '../../utils/query.js';

const createBlogCategory = (data: Prisma.BlogCategoryCreateInput): Promise<BlogCategory> =>
  db('create category', () => prisma.blogCategory.create({ data }));

const updateBlogCategory = (
  where: Prisma.BlogCategoryWhereUniqueInput,
  data: Prisma.BlogCategoryUpdateInput,
): Promise<BlogCategory> => db('update category', () => prisma.blogCategory.update({ where, data }));

/** Soft delete: only flags the row DELETED (status + deletedAt) — every other column keeps its value. */
const deleteBlogCategory = (id: string): Promise<BlogCategory> =>
  db('delete category', () => prisma.blogCategory.update({ where: { id }, data: softDeleteData() }));

const findBlogCategory = (where: Prisma.BlogCategoryWhereInput): Promise<BlogCategory | null> =>
  db('find category', () => prisma.blogCategory.findFirst({ where: { ...NOT_DELETED, ...where } }));

/** Categories are few, so the list is not paginated. */
const findBlogCategories = (where?: Prisma.BlogCategoryWhereInput): Promise<BlogCategory[]> =>
  db('find categories', () =>
    prisma.blogCategory.findMany({ where: { ...NOT_DELETED, ...where }, orderBy: { name: 'asc' } }),
  );

export { createBlogCategory, updateBlogCategory, deleteBlogCategory, findBlogCategory, findBlogCategories };
