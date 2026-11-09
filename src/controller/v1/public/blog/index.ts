import { Request, Response } from 'express';
import { makeResponse } from '../../../../lib/response/index.js';
import { buildMeta, parsePagination, wrapController } from '../../../../utils/index.js';
import { findBlog, findBlogCategories, findBlogsWithPagination } from '../../../../services/index.js';
import { livePost, strip, stripAll } from '../shared.js';

const blogList = async (req: Request, res: Response) => {
  const { page, limit, skip } = parsePagination(req.query);
  const category = typeof req.query.category === 'string' ? req.query.category : undefined; // category slug
  const { blogs, total } = await findBlogsWithPagination(
    { ...livePost(), ...(category && { category: { slug: category } }) },
    skip,
    limit,
    true, // cards only — the article body comes from /blog?slug=
  );
  return makeResponse(req, res, 200, true, 'fetch', stripAll(blogs), buildMeta(page, limit, total));
};

const blogDetail = async (req: Request, res: Response) => {
  const blog = await findBlog({ ...livePost(), slug: String(req.query.slug ?? '') });
  if (!blog) return makeResponse(req, res, 404, false, 'not_exist');
  return makeResponse(req, res, 200, true, 'fetch', strip(blog));
};

const blogCategoryList = async (req: Request, res: Response) => {
  const categories = await findBlogCategories({ status: 'ACTIVE' });
  return makeResponse(req, res, 200, true, 'fetch', stripAll(categories));
};

export const publicBlogController = wrapController({ blogList, blogDetail, blogCategoryList });
