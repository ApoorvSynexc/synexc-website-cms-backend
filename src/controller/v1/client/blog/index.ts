import { Response } from 'express';
import { makeResponse } from '../../../../lib/response/index.js';
import { IRequest } from '../../../../lib/index.js';
import { buildMeta, parsePagination, toDate, wrapController } from '../../../../utils/index.js';
import {
  assertMediaExists,
  createBlog,
  deleteBlog,
  findBlog,
  findBlogCategory,
  findBlogsWithPagination,
  getBlogStats,
  mediaConnect,
  mediaLink,
  uniqueSlug,
  updateBlog,
} from '../../../../services/index.js';

const createHandler = async (req: IRequest, res: Response) => {
  const { title, excerpt, content, categoryId, author, featuredImageId, publishStatus, publishedAt, status } = req.body;

  if (!(await findBlogCategory({ id: categoryId }))) return makeResponse(req, res, 400, false, 'invalid_reference');
  await assertMediaExists([featuredImageId]);

  const blog = await createBlog({
    title,
    slug: await uniqueSlug('blog', title, 160), // server-generated; never changes after creation so URLs stay stable
    excerpt,
    content,
    author,
    featuredImage: mediaConnect(featuredImageId),
    publishStatus: publishStatus ?? 'DRAFT',
    publishedAt: toDate(publishedAt),
    status: status ?? 'ACTIVE',
    category: { connect: { id: categoryId } },
    ...(req.user?.id && { createdBy: { connect: { id: req.user.id } } }),
  });
  return makeResponse(req, res, 201, true, 'create', blog);
};

const findBlogsHandler = async (req: IRequest, res: Response) => {
  const { page, limit, skip } = parsePagination(req.query);
  const { search, categoryId, publishStatus } = req.query as Record<string, string | undefined>;

  const { blogs, total } = await findBlogsWithPagination(
    {
      ...(categoryId && { categoryId }),
      ...(publishStatus && { publishStatus: publishStatus as 'DRAFT' | 'PUBLISHED' }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { author: { contains: search, mode: 'insensitive' } },
        ],
      }),
    },
    skip,
    limit,
  );
  return makeResponse(req, res, 200, true, 'fetch', blogs, buildMeta(page, limit, total));
};

const statsHandler = async (req: IRequest, res: Response) =>
  makeResponse(req, res, 200, true, 'fetch', await getBlogStats());

const findBlogHandler = async (req: IRequest, res: Response) => {
  const blog = await findBlog({ id: String(req.query.id) });
  if (!blog) return makeResponse(req, res, 404, false, 'not_exist');
  return makeResponse(req, res, 200, true, 'fetch', blog);
};

const updateHandler = async (req: IRequest, res: Response) => {
  const { id, title, excerpt, content, categoryId, author, featuredImageId, publishStatus, publishedAt, status } = req.body;
  if (!(await findBlog({ id }))) return makeResponse(req, res, 404, false, 'not_exist');

  await assertMediaExists([featuredImageId]);
  if (categoryId && !(await findBlogCategory({ id: categoryId }))) {
    return makeResponse(req, res, 400, false, 'invalid_reference');
  }

  const blog = await updateBlog(
    { id },
    {
      ...(title !== undefined && { title }),
      ...(excerpt !== undefined && { excerpt }),
      ...(content !== undefined && { content }),
      ...(author !== undefined && { author }),
      featuredImage: mediaLink(featuredImageId),
      ...(publishStatus && { publishStatus }),
      ...(publishedAt && { publishedAt: toDate(publishedAt) }),
      ...(status && { status }),
      ...(categoryId && { category: { connect: { id: categoryId } } }),
    },
  );
  return makeResponse(req, res, 200, true, 'update', blog);
};

const deleteHandler = async (req: IRequest, res: Response) => {
  const id = String(req.query.id ?? '');
  if (!id) throw new Error('Blog ID is required in query params');

  const blog = await findBlog({ id });
  if (!blog) return makeResponse(req, res, 404, false, 'not_exist');

  await deleteBlog(blog.id);
  return makeResponse(req, res, 200, true, 'delete', null);
};

export const blogController = wrapController({
  createHandler,
  findBlogsHandler,
  statsHandler,
  findBlogHandler,
  updateHandler,
  deleteHandler,
});
