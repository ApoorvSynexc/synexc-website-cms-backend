import { Request, Response } from 'express';
import { makeResponse } from '../../../../lib/response/index.js';
import { buildMeta, parsePagination, wrapController } from '../../../../utils/index.js';
import { findCaseStudiesWithPagination, findCaseStudy } from '../../../../services/index.js';
import { livePost, strip, stripAll } from '../shared.js';

const caseStudyList = async (req: Request, res: Response) => {
  const { page, limit, skip } = parsePagination(req.query);
  const category = typeof req.query.category === 'string' ? req.query.category : undefined;
  const { caseStudies, total } = await findCaseStudiesWithPagination(
    { ...livePost(), ...(category && { category }) },
    skip,
    limit,
    true, // cards only — the case study body comes from /case-study?slug=
  );
  return makeResponse(req, res, 200, true, 'fetch', stripAll(caseStudies), buildMeta(page, limit, total));
};

const caseStudyDetail = async (req: Request, res: Response) => {
  const caseStudy = await findCaseStudy({ ...livePost(), slug: String(req.query.slug ?? '') });
  if (!caseStudy) return makeResponse(req, res, 404, false, 'not_exist');
  return makeResponse(req, res, 200, true, 'fetch', strip(caseStudy));
};

export const publicCaseStudyController = wrapController({ caseStudyList, caseStudyDetail });
