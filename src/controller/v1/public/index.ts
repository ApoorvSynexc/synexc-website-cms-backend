import { Request, Response } from 'express';
import dayjs from 'dayjs';
import { makeResponse } from '../../../lib/response/index.js';
import { buildMeta, parsePagination, wrapController } from '../../../utils/index.js';
import {
  certificationService,
  faqService,
  findBlog,
  findBlogCategories,
  findBlogsWithPagination,
  findCaseStudiesWithPagination,
  findCaseStudy,
  findLiveAnnouncements,
  findSiteSetting,
  galleryImageService,
  heroSlideService,
  keyStatService,
  partnerLogoService,
  teamMemberService,
  testimonialService,
  timelineEventService,
} from '../../../services/index.js';

/**
 * Read-only endpoints for the public website. No login; they only ever return content that is switched on
 * (status ACTIVE) and, for articles, published. Audit columns (createdById, deletedAt) are never exposed.
 */
const strip = <T extends Record<string, any>>(row: T) => {
  const { createdById: _c, deletedAt: _d, ...rest } = row;
  return rest;
};
const stripAll = <T extends Record<string, any>>(rows: T[]) => rows.map(strip);

// Visitors can see an article once its publish date has arrived.
const livePost = () => ({ status: 'ACTIVE' as const, publishStatus: 'PUBLISHED' as const, publishedAt: { lte: new Date() } });

const blogList = async (req: Request, res: Response) => {
  const { page, limit, skip } = parsePagination(req.query);
  const category = typeof req.query.category === 'string' ? req.query.category : undefined; // category slug
  const { blogs, total } = await findBlogsWithPagination(
    { ...livePost(), ...(category && { category: { slug: category } }) },
    skip,
    limit,
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

const caseStudyList = async (req: Request, res: Response) => {
  const { page, limit, skip } = parsePagination(req.query);
  const category = typeof req.query.category === 'string' ? req.query.category : undefined;
  const { caseStudies, total } = await findCaseStudiesWithPagination(
    { ...livePost(), ...(category && { category }) },
    skip,
    limit,
  );
  return makeResponse(req, res, 200, true, 'fetch', stripAll(caseStudies), buildMeta(page, limit, total));
};

const caseStudyDetail = async (req: Request, res: Response) => {
  const caseStudy = await findCaseStudy({ ...livePost(), slug: String(req.query.slug ?? '') });
  if (!caseStudy) return makeResponse(req, res, 404, false, 'not_exist');
  return makeResponse(req, res, 200, true, 'fetch', strip(caseStudy));
};

/** Announcements switched on and inside their display window today. */
const announcementList = async (req: Request, res: Response) => {
  const today = new Date(`${dayjs().format('YYYY-MM-DD')}T00:00:00.000Z`);
  const announcements = await findLiveAnnouncements(today);
  return makeResponse(req, res, 200, true, 'fetch', stripAll(announcements));
};

const siteSetting = async (req: Request, res: Response) => {
  const setting = await findSiteSetting();
  if (!setting || setting.status !== 'ACTIVE') return makeResponse(req, res, 404, false, 'not_exist');
  return makeResponse(req, res, 200, true, 'fetch', strip(setting));
};

/** Visible items of an ordered list, in the order the team arranged them. */
const visibleList =
  (service: { findAll: (where?: Record<string, unknown>) => Promise<any[]> }, filters: Record<string, (v: string) => Record<string, unknown>> = {}) =>
  async (req: Request, res: Response) => {
    const where = Object.entries(filters).reduce<Record<string, unknown>>((acc, [key, build]) => {
      const value = req.query[key];
      return typeof value === 'string' && value ? { ...acc, ...build(value) } : acc;
    }, { status: 'ACTIVE' });
    return makeResponse(req, res, 200, true, 'fetch', stripAll(await service.findAll(where)));
  };

export const publicController = wrapController({
  blogList,
  blogDetail,
  blogCategoryList,
  caseStudyList,
  caseStudyDetail,
  announcementList,
  siteSetting,
  heroSlideList: visibleList(heroSlideService),
  testimonialList: visibleList(testimonialService, { page: (v) => ({ pages: { has: v } }) }),
  faqList: visibleList(faqService, { group: (v) => ({ group: v }) }),
  partnerLogoList: visibleList(partnerLogoService, { placement: (v) => ({ placement: v }) }),
  teamMemberList: visibleList(teamMemberService),
  timelineEventList: visibleList(timelineEventService),
  certificationList: visibleList(certificationService),
  keyStatList: visibleList(keyStatService),
  galleryImageList: visibleList(galleryImageService, { album: (v) => ({ album: v }) }),
});
