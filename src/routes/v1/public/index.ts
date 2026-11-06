import { Router } from 'express';
import { publicController } from '../../../controller/index.js';

/**
 * Read-only content for the public website — no login. Mounted at /api/v1/public.
 * Lists accept optional filters, e.g. /testimonial/list?page=about, /faq/list?group=Industries,
 * /gallery-image/list?album=Life%20at%20Synexc
 */
const router = Router();

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
