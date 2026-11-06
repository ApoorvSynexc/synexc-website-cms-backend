import { Response } from 'express';
import { makeResponse } from '../../../../lib/response/index.js';
import { IRequest } from '../../../../lib/index.js';
import { buildMeta, parsePagination, toDate, wrapController } from '../../../../utils/index.js';
import {
  assertMediaExists,
  createCaseStudy,
  deleteCaseStudy,
  findCaseStudiesWithPagination,
  findCaseStudy,
  mediaConnect,
  mediaLink,
  uniqueSlug,
  updateCaseStudy,
} from '../../../../services/index.js';

const createHandler = async (req: IRequest, res: Response) => {
  const { title, client, category, description, imageId, content, tags, results, readTime, publishStatus, publishedAt, status } = req.body;

  await assertMediaExists([imageId]);
  const caseStudy = await createCaseStudy({
    title,
    slug: await uniqueSlug('caseStudy', title, 160), // server-generated; never changes after creation
    client,
    category,
    description,
    image: mediaConnect(imageId),
    content,
    tags: tags ?? [],
    results: results ?? [],
    readTime,
    publishStatus: publishStatus ?? 'DRAFT',
    publishedAt: toDate(publishedAt),
    status: status ?? 'ACTIVE',
    ...(req.user?.id && { createdBy: { connect: { id: req.user.id } } }),
  });
  return makeResponse(req, res, 201, true, 'create', caseStudy);
};

const findCaseStudiesHandler = async (req: IRequest, res: Response) => {
  const { page, limit, skip } = parsePagination(req.query);
  const { search, category, publishStatus } = req.query as Record<string, string | undefined>;

  const { caseStudies, total } = await findCaseStudiesWithPagination(
    {
      ...(category && { category }),
      ...(publishStatus && { publishStatus: publishStatus as 'DRAFT' | 'PUBLISHED' }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { client: { contains: search, mode: 'insensitive' } },
        ],
      }),
    },
    skip,
    limit,
  );
  return makeResponse(req, res, 200, true, 'fetch', caseStudies, buildMeta(page, limit, total));
};

const findCaseStudyHandler = async (req: IRequest, res: Response) => {
  const caseStudy = await findCaseStudy({ id: String(req.query.id) });
  if (!caseStudy) return makeResponse(req, res, 404, false, 'not_exist');
  return makeResponse(req, res, 200, true, 'fetch', caseStudy);
};

const updateHandler = async (req: IRequest, res: Response) => {
  const { id, title, client, category, description, imageId, content, tags, results, readTime, publishStatus, publishedAt, status } = req.body;
  if (!(await findCaseStudy({ id }))) return makeResponse(req, res, 404, false, 'not_exist');
  await assertMediaExists([imageId]);

  const caseStudy = await updateCaseStudy(
    { id },
    {
      ...(title !== undefined && { title }),
      ...(client !== undefined && { client }),
      ...(category !== undefined && { category }),
      ...(description !== undefined && { description }),
      image: mediaLink(imageId),
      ...(content !== undefined && { content }),
      ...(tags !== undefined && { tags }),
      ...(results !== undefined && { results }),
      ...(readTime !== undefined && { readTime }),
      ...(publishStatus && { publishStatus }),
      ...(publishedAt && { publishedAt: toDate(publishedAt) }),
      ...(status && { status }),
    },
  );
  return makeResponse(req, res, 200, true, 'update', caseStudy);
};

const deleteHandler = async (req: IRequest, res: Response) => {
  const id = String(req.query.id ?? '');
  if (!id) throw new Error('Case study ID is required in query params');

  const caseStudy = await findCaseStudy({ id });
  if (!caseStudy) return makeResponse(req, res, 404, false, 'not_exist');

  await deleteCaseStudy(caseStudy.id);
  return makeResponse(req, res, 200, true, 'delete', null);
};

export const caseStudyController = wrapController({
  createHandler,
  findCaseStudiesHandler,
  findCaseStudyHandler,
  updateHandler,
  deleteHandler,
});
