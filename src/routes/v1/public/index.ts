import { NextFunction, Request, Response, Router } from 'express';
import { publicController } from '../../../controller/index.js';

/**
 * Read-only content for the public website — no login. Mounted at /api/v1/public.
 * Lists accept optional filters, e.g. /testimonial/list?page=about, /faq/list?group=Industries,
 * /gallery-image/list?album=Life%20at%20Synexc
 */
const router = Router();

/**
 * Let browsers and the website's CDN reuse responses briefly, so a busy site does not hit the database on every
 * page view. Content edited in the CMS shows up within CACHE_SECONDS. Errors are never cached.
 * Set PUBLIC_CACHE_SECONDS=0 to switch caching off.
 */
const CACHE_SECONDS = Number(process.env.PUBLIC_CACHE_SECONDS ?? 60);
router.use((req: Request, res: Response, next: NextFunction) => {
  if (CACHE_SECONDS > 0) {
    res.setHeader('Cache-Control', `public, max-age=${CACHE_SECONDS}, stale-while-revalidate=${CACHE_SECONDS * 5}`);
    const send = res.send.bind(res);
    res.send = (body) => {
      if (res.statusCode >= 400) res.setHeader('Cache-Control', 'no-store');
      return send(body);
    };
  }
  next();
});

router.get('/blog/list', publicController.blogList);
router.get('/blog', publicController.blogDetail); // ?slug=
router.get('/blog-category/list', publicController.blogCategoryList);
router.get('/case-study/list', publicController.caseStudyList);
router.get('/case-study', publicController.caseStudyDetail); // ?slug=
router.get('/announcement/list', publicController.announcementList);
router.get('/site-setting', publicController.siteSetting);
router.get('/hero-slide/list', publicController.heroSlideList);
router.get('/testimonial/list', publicController.testimonialList);
router.get('/faq/list', publicController.faqList);
router.get('/partner-logo/list', publicController.partnerLogoList);
router.get('/team-member/list', publicController.teamMemberList);
router.get('/timeline-event/list', publicController.timelineEventList);
router.get('/certification/list', publicController.certificationList);
router.get('/key-stat/list', publicController.keyStatList);
router.get('/gallery-image/list', publicController.galleryImageList);

export const publicRouter = router;
