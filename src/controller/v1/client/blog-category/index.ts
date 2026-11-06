import { Response } from 'express';
import { makeResponse } from '../../../../lib/response/index.js';
import { IRequest } from '../../../../lib/index.js';
import { generateSlug, wrapController } from '../../../../utils/index.js';
import {
  countBlogs,
  createBlogCategory,
  deleteBlogCategory,
  findBlogCategories,
  findBlogCategory,
  updateBlogCategory,
} from '../../../../services/index.js';

const createHandler = async (req: IRequest, res: Response) => {
  const { name, slug, description } = req.body;
  const category = await createBlogCategory({
    name,
    slug: slug || generateSlug(name),
    description: description || undefined,
    ...(req.user?.id && { createdBy: { connect: { id: req.user.id } } }),
  });
  return makeResponse(req, res, 201, true, 'create', category);
};

/** Not paginated — categories are few and the blog form needs all of them. */
const findCategoriesHandler = async (req: IRequest, res: Response) => {
  const categories = await findBlogCategories();
  return makeResponse(req, res, 200, true, 'fetch', categories);
};

const findCategoryHandler = async (req: IRequest, res: Response) => {
  const category = await findBlogCategory({ id: String(req.query.id) });
  if (!category) return makeResponse(req, res, 404, false, 'not_exist');
  return makeResponse(req, res, 200, true, 'fetch', category);
};

const updateHandler = async (req: IRequest, res: Response) => {
  const { id, name, slug, description, status } = req.body;
  if (!(await findBlogCategory({ id }))) return makeResponse(req, res, 404, false, 'not_exist');

  const category = await updateBlogCategory(
    { id },
    {
      ...(name !== undefined && { name }),
      ...(slug !== undefined && { slug }),
      ...(description !== undefined && { description: description || null }),
      ...(status && { status }),
    },
  );
  return makeResponse(req, res, 200, true, 'update', category);
};

const deleteHandler = async (req: IRequest, res: Response) => {
  const id = String(req.query.id ?? '');
  if (!id) throw new Error('Category ID is required in query params');

  const category = await findBlogCategory({ id });
  if (!category) return makeResponse(req, res, 404, false, 'not_exist');
  if ((await countBlogs({ categoryId: id })) > 0) return makeResponse(req, res, 409, false, 'category_in_use');

  await deleteBlogCategory(category.id);
  return makeResponse(req, res, 200, true, 'delete', null);
};

export const blogCategoryController = wrapController({
  createHandler,
  findCategoriesHandler,
  findCategoryHandler,
  updateHandler,
  deleteHandler,
});
